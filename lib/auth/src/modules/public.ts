import { Context } from 'hono';
import { env } from 'hono/adapter';
import jwtService from './jwt';
import passwordService from './password';
import emailService from './email';

const EXPIRES_IN = 60 * 60; // 1 hour
const STATUS_PENDING = 'pending';
const STATUS_ACTIVE = 'active';

interface CommonAuthResponse {
	access_token: string;
	token_type: string;
	expires_in: number;
}

export interface SignUpResponse extends CommonAuthResponse {}
export interface LoginResponse extends CommonAuthResponse {}
interface RefreshTokenResponse extends CommonAuthResponse {}
interface VerifyEmailResponse {
	success: boolean;
	message: string;
}
interface ResendEmailResponse {
	success: boolean;
	message: string;
}

const publicService = {
	signUp: async ({ email, password, confirmPassword }: { email: string; password: string; confirmPassword: string }, c: Context) => {
		if (password !== confirmPassword) {
			return c.json({ error: 'Passwords do not match' }, 400);
		}

		const db = env(c).DB;
		try {
			const hashedPassword = await passwordService.hashPassword(password);
			const d1Result: D1Result = await db
				.prepare('INSERT INTO users (id, email, username, password, status) VALUES (?, ?, ?, ?, ?) RETURNING id, email, username')
				// we are use the email as the username by default
				// account status is pending til user verifies their email
				.bind(crypto.randomUUID(), email, email, hashedPassword, STATUS_PENDING)
				.run();

			if (!d1Result.success) {
				return c.json({ error: d1Result.error }, 500);
			}

			const user = d1Result.results?.[0] as { id: string };
			if (!user) {
				throw new Error('Failed to create user');
			}

			// add the password to the password history
			const passwordHistoryResult = await passwordService.addToPasswordHistory({ userId: user.id, passwordHash: hashedPassword }, c);
			if (passwordHistoryResult instanceof Error) {
				return c.json({ error: passwordHistoryResult.message }, 500);
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
				.prepare('SELECT id, password, status, failed_login_attempts, locked_until FROM users WHERE email = ?')
				.bind(email)
				.run();

			if (!d1Result.success) {
				return c.json({ error: d1Result.error }, 500);
			}

			const user = d1Result.results?.[0] as {
				id: string;
				password: string;
				status: string;
				failed_login_attempts: number;
				locked_until: string | null;
			};

			if (!user) {
				throw new Error('User not found');
			}

			// Check account status
			if (user.status === 'deleted') {
				throw new Error('Account has been deleted');
			}

			if (user.status === 'suspended') {
				throw new Error('Account has been suspended. Please contact support.');
			}

			// Check if account is locked
			if (user.locked_until && new Date(user.locked_until) > new Date() && user.status === 'temporarily_locked') {
				throw new Error('Account is temporarily locked. Please reset your password via email.');
			}

			const loginAttemptResult = await passwordService.handleLoginAttempt({ user, passwordAttempt: password }, c);
			if (loginAttemptResult instanceof Error || loginAttemptResult.error) {
				return c.json({ error: loginAttemptResult.error }, 500);
			}

			const payload = {
				id: user.id,
				exp: Math.floor(Date.now() / 1000) + EXPIRES_IN,
			};

			const token = await jwtService.assignRefreshToken(c, payload);
			if (token instanceof Error) {
				return c.json({ error: token.message }, 500);
			}

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
	verifyEmail: async ({ token }: { token: string }, c: Context) => {
		const db = env(c).DB;
		// check for valid token of type 'email' that hasn't been used and hasn't expired
		const d1Result: D1Result = await db
			.prepare(
				`
				SELECT * FROM verification_tokens 
				WHERE token = ? 
				AND type = 'email' 
				AND used_at IS NULL 
				AND expires_at > CURRENT_TIMESTAMP
			`
			)
			.bind(token)
			.run();

		if (!d1Result.success) {
			return c.json({ error: 'Invalid verification token' }, 401);
		}

		const tokenData = d1Result.results?.[0] as {
			expires_at: string;
			user_id: string;
		};

		if (!tokenData) {
			return c.json({ error: 'Token expired or already used' }, 401);
		}

		// start a transaction for updating both user status and token usage
		const transaction = db.batch([
			db.prepare('UPDATE users SET status = ?, email_verified_at = CURRENT_TIMESTAMP WHERE id = ?').bind(STATUS_ACTIVE, tokenData.user_id),
			db.prepare('UPDATE verification_tokens SET used_at = CURRENT_TIMESTAMP WHERE token = ?').bind(token),
		]);

		const results = await transaction;
		const [updateUserResult, updateTokenResult] = results;

		if (!updateUserResult.success || !updateTokenResult.success) {
			return c.json({ error: 'Failed to verify email' }, 500);
		}

		return c.json<VerifyEmailResponse>({ success: true, message: 'Email verified successfully' });
	},
	forgotPassword: async ({ email }: { email: string }, c: Context) => {
		try {
			const result = await passwordService.initiateReset(email, c);
			return c.json(result);
		} catch (error) {
			return c.json(
				{
					success: false,
					message: 'Failed to process password reset request',
				},
				500
			);
		}
	},
	resetPassword: async ({ token, password }: { token: string; password: string }, c: Context) => {
		try {
			const result = await passwordService.completeReset({ token, newPassword: password }, c);
			return c.json(result);
		} catch (error) {
			return c.json(
				{
					success: false,
					message: 'Failed to reset password',
				},
				500
			);
		}
	},
	resendVerificationEmail: async ({ email }: { email: string }, c: Context) => {
		const db = env(c).DB;

		try {
			// Find the user and verify they exist and are still pending
			const userResult = await db.prepare('SELECT id, email, status FROM users WHERE email = ?').bind(email).run();

			if (!userResult.success) {
				throw new Error('Database error while looking up user');
			}

			const user = userResult.results?.[0] as { id: string; email: string; status: string } | undefined;

			if (!user) {
				return c.json<ResendEmailResponse>({
					success: false,
					message: 'If a matching account was found, a verification email has been sent.',
				});
			}

			// Check if user is already verified
			if (user.status === STATUS_ACTIVE) {
				return c.json<ResendEmailResponse>({
					success: false,
					message: 'Email is already verified',
				});
			}

			// Check if user is pending
			const allowedStatuses = ['pending'];
			if (!allowedStatuses.includes(user.status)) {
				return c.json<ResendEmailResponse>({
					success: false,
					message: 'Unable to resend verification email',
				});
			}

			// Check for rate limiting (optional but recommended)
			const lastEmailResult = await db
				.prepare(
					`
					SELECT created_at 
					FROM verification_tokens 
					WHERE user_id = ? 
					AND type = 'email' 
					ORDER BY created_at DESC 
					LIMIT 1
				`
				)
				.bind(user.id)
				.run();

			if (lastEmailResult.success && lastEmailResult.results?.[0]) {
				const lastSent = new Date(lastEmailResult.results[0].created_at);
				const timeSinceLastEmail = Date.now() - lastSent.getTime();
				const MIN_RESEND_INTERVAL = 5 * 60 * 1000; // 5 minutes

				if (timeSinceLastEmail < MIN_RESEND_INTERVAL) {
					return c.json<ResendEmailResponse>({
						success: false,
						message: 'Please wait 5 minutes before requesting another verification email',
					});
				}
			}

			// Send new verification email
			const emailResult = await emailService.sendVerificationEmail({ to: email, user }, c);
			if (emailResult instanceof Error || emailResult?.error?.message) {
				throw new Error(emailResult?.error?.message || 'Failed to send verification email');
			}

			return c.json<ResendEmailResponse>({
				success: true,
				message: 'Verification email has been resent',
			});
		} catch (error) {
			return c.json<ResendEmailResponse>(
				{
					success: false,
					message: error instanceof Error ? error.message : 'Failed to resend verification email',
				},
				500
			);
		}
	},
};

export default publicService;
