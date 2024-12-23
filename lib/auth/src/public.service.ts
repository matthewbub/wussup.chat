import { Context } from 'hono';
import { v4 as uuidv4 } from 'uuid';
import { env } from 'hono/adapter';
import jwtService from './jwt.service';
import passwordService from './password.service';
import emailService from './email.service';

const EXPIRES_IN = 60 * 60; // 1 hour
const STATUS_PENDING = 'pending';

interface CommonAuthResponse {
	access_token: string;
	token_type: string;
	expires_in: number;
}

export interface SignUpResponse extends CommonAuthResponse {}
export interface LoginResponse extends CommonAuthResponse {}
interface RefreshTokenResponse extends CommonAuthResponse {}
const publicService = {
	signUp: async ({ email, password, confirmPassword }: { email: string; password: string; confirmPassword: string }, c: Context) => {
		if (password !== confirmPassword) {
			return c.json({ error: 'Passwords do not match' }, 400);
		}

		const db = env(c).DB;
		console.log('db', db);
		try {
			const hashedPassword = await passwordService.hashPassword(password);

			console.log(`Hashed Password: ${hashedPassword}`);
			const d1Result: D1Result = await db
				.prepare('INSERT INTO users (id, email, username, password, status) VALUES (?, ?, ?, ?, ?) RETURNING id, email, username')
				// we are use the email as the username by default
				// account status is pending til user verifies their email
				.bind(uuidv4(), email, email, hashedPassword, STATUS_PENDING)
				.run();

			if (!d1Result.success) {
				return c.json({ error: d1Result.error }, 500);
			}

			const user = d1Result.results?.[0] as { id: string };
			if (!user) {
				throw new Error('Failed to create user');
			}

			// this is the point at which we send the initial verification email
			const emailResult = await emailService.sendVerificationEmail({ to: email, user }, c);
			if (emailResult instanceof Error || emailResult?.error?.message) {
				return c.json({ error: emailResult?.error?.message }, 500);
			}

			// create a "payload" object
			// were gonna encrypt this and then
			// decrypt it at validation time
			const payload = {
				id: user.id,
				exp: Math.floor(Date.now() / 1000) + EXPIRES_IN,
			};

			// encrypt the payload with an auth key
			// we need the auth key to decrypt at validation time
			const token = await jwtService.assignRefreshToken(c, payload);
			if (token instanceof Error) {
				console.log('token failed', token);
				// throw new Error(token.message);
				return c.json({ error: token.message }, 500);
			}

			// standardized OAuth-style response
			return c.json<SignUpResponse>({
				access_token: token,
				token_type: 'Bearer',
				expires_in: EXPIRES_IN,
			});
		} catch (error) {
			return c.json({ error: error instanceof Error ? error.message : 'Unknown error' }, 500);
		}
	},
	login: async ({ email, password }: { email: string; password: string }, c: Context) => {
		const db = env(c).DB;
		try {
			const d1Result: D1Result = await db
				.prepare('SELECT id, email, username, password, status FROM users WHERE email = ?')
				.bind(email)
				.run();

			if (!d1Result.success) {
				return c.json({ error: d1Result.error }, 500);
			}

			const user = d1Result.results?.[0] as { id: string; email: string; username: string; password: string; status: string };
			if (!user) {
				throw new Error('User not found');
			}

			// verify the password using the stored hash and the password attempt
			const isPasswordValid = await passwordService.verifyPassword(user.password, password);
			if (!isPasswordValid) {
				throw new Error('Invalid password');
			}

			// create a "payload" object
			// were gonna encrypt this and then
			// decrypt it at validation time
			const payload = {
				id: user.id,
				exp: Math.floor(Date.now() / 1000) + EXPIRES_IN,
			};

			// encrypt the payload with an auth key
			// we need the auth key to decrypt at validation time
			const token = await jwtService.assignRefreshToken(c, payload);
			if (token instanceof Error) {
				return c.json({ error: token.message }, 500);
			}

			// standardized OAuth-style response
			return c.json<LoginResponse>({
				access_token: token,
				token_type: 'Bearer',
				expires_in: EXPIRES_IN,
			});
		} catch (error) {
			return c.json({ error: error instanceof Error ? error.message : 'Unknown error' }, 500);
		}
	},
	refreshToken: async ({ refreshToken }: { refreshToken: string }, c: Context) => {
		const db = env(c).DB;

		const d1Result: D1Result = await db.prepare('SELECT * FROM refresh_tokens WHERE token = ?').bind(refreshToken).run();

		if (!d1Result.success) {
			return c.json({ error: 'Invalid refresh token' }, 401);
		}

		const tokenData = d1Result.results?.[0] as { expires_at: string; revoked_at: string | null; user_id: string };
		if (!tokenData) {
			return c.json({ error: 'Invalid refresh token' }, 401);
		}

		// verify the refresh token
		const isValid = await jwtService.validateTokenAndUser(tokenData, c);
		if (!isValid) {
			return c.json({ error: 'Invalid refresh token' }, 401);
		}

		// revoke the old refresh token first
		const revoked = await jwtService.revokeRefreshToken(refreshToken, c);
		if (!revoked) {
			return c.json({ error: 'Failed to revoke refresh token' }, 500);
		}

		const payload = {
			id: tokenData.user_id,
			exp: Math.floor(Date.now() / 1000) + EXPIRES_IN,
		};

		// create a new access token
		const newToken = await jwtService.assignRefreshToken(c, payload);
		if (newToken instanceof Error) {
			return c.json({ error: newToken.message }, 500);
		}

		// return the new access token
		return c.json<RefreshTokenResponse>({
			access_token: newToken,
			token_type: 'Bearer',
			expires_in: EXPIRES_IN,
		});
	},
};

export default publicService;
