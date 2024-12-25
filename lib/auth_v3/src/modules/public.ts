import { Context } from 'hono';
import { env } from 'hono/adapter';
import jwtService from './jwt';
import passwordService from './password';
import emailService from './email';

const EXPIRES_IN = 60 * 60; // 1 hour
const STATUS_PENDING = 'pending';
const STATUS_ACTIVE = 'active';

// error codes
const ERROR_CODES = {
	INVALID_EMAIL_FORMAT: 'INVALID_EMAIL_FORMAT',
	WEAK_PASSWORD: 'WEAK_PASSWORD',
	PASSWORDS_DO_NOT_MATCH: 'PASSWORDS_DO_NOT_MATCH',
	EMAIL_ALREADY_IN_USE: 'EMAIL_ALREADY_IN_USE',
	USER_CREATION_FAILED: 'USER_CREATION_FAILED',
	PASSWORD_HISTORY_ERROR: 'PASSWORD_HISTORY_ERROR',
	EMAIL_SEND_ERROR: 'EMAIL_SEND_ERROR',
	TOKEN_GENERATION_ERROR: 'TOKEN_GENERATION_ERROR',
	UNEXPECTED_ERROR: 'UNEXPECTED_ERROR',
	SUCCESS: 'SUCCESS',
};

// error messages
const ERROR_MESSAGES = {
	INVALID_EMAIL_FORMAT: 'Invalid email format',
	WEAK_PASSWORD: 'Password must be at least 8 characters long',
	PASSWORDS_DO_NOT_MATCH: 'Passwords do not match',
	EMAIL_ALREADY_IN_USE: 'Email already in use',
	USER_CREATION_FAILED: 'Failed to create user',
	PASSWORD_HISTORY_ERROR: 'Error adding password to history',
	EMAIL_SEND_ERROR: 'Failed to send verification email',
	TOKEN_GENERATION_ERROR: 'Error generating token',
	UNEXPECTED_ERROR: 'Unknown error',
	SUCCESS: 'User created successfully',
};

interface CommonAuthResponse {
	access_token: string;
	token_type: string;
	expires_in: number;
}

export interface SignUpResponse extends CommonAuthResponse {
	verificationToken?: string; // Optional since it's only included in development
}

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
		const db = env(c).DB;

		// standard response format with error code
		const createResponse = (success: boolean, message: string, code: string, data: any = null) => ({
			success,
			message,
			code,
			data,
		});

		try {
			// check for existing email
			const existingUserResult = await db.prepare('SELECT id FROM users WHERE email = ?').bind(email).run();
			if (existingUserResult.success && existingUserResult.results?.length) {
				return c.json(createResponse(false, ERROR_MESSAGES.EMAIL_ALREADY_IN_USE, ERROR_CODES.EMAIL_ALREADY_IN_USE), 409);
			}

			const hashedPassword = await passwordService.hashPassword(password);
			const d1Result: D1Result = await db
				.prepare('INSERT INTO users (id, email, username, password, status) VALUES (?, ?, ?, ?, ?) RETURNING id, email, username')
				// we are use the email as the username by default
				// account status is pending til user verifies their email
				.bind(crypto.randomUUID(), email, email, hashedPassword, STATUS_PENDING)
				.run();

			if (!d1Result.success) {
				return c.json(createResponse(false, ERROR_MESSAGES.USER_CREATION_FAILED, ERROR_CODES.USER_CREATION_FAILED, d1Result.error), 500);
			}

			const user = d1Result.results?.[0] as { id: string };
			if (!user) {
				throw new Error(ERROR_MESSAGES.USER_CREATION_FAILED);
			}

			// add the password to the password history
			const passwordHistoryResult = await passwordService.addToPasswordHistory({ userId: user.id, passwordHash: hashedPassword }, c);
			if (passwordHistoryResult instanceof Error) {
				return c.json(createResponse(false, ERROR_MESSAGES.PASSWORD_HISTORY_ERROR, ERROR_CODES.PASSWORD_HISTORY_ERROR), 500);
			}

			// this is the point at which we send the initial verification email
			const emailResult = await emailService.sendVerificationEmail({ to: email, user }, c);
			if (emailResult instanceof Error || emailResult?.error?.message) {
				return c.json(
					createResponse(false, emailResult?.error?.message || ERROR_MESSAGES.EMAIL_SEND_ERROR, ERROR_CODES.EMAIL_SEND_ERROR),
					500
				);
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
				return c.json(createResponse(false, token.message, ERROR_CODES.TOKEN_GENERATION_ERROR), 500);
			}

			return c.json(
				createResponse(true, ERROR_MESSAGES.SUCCESS, ERROR_CODES.SUCCESS, {
					access_token: token,
					token_type: 'Bearer',
					expires_in: EXPIRES_IN,
					...(env(c).ENV === 'development' && { verificationToken: emailResult.verificationToken }),
				})
			);
		} catch (error) {
			return c.json(
				createResponse(false, error instanceof Error ? error.message : ERROR_MESSAGES.UNEXPECTED_ERROR, ERROR_CODES.UNEXPECTED_ERROR),
				500
			);
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
				return c.json({ error: d1Result.error, code: 'DB_ERROR' }, 500);
			}

			const user = d1Result.results?.[0] as {
				id: string;
				password: string;
				status: string;
				failed_login_attempts: number;
				locked_until: string | null;
			};

			if (!user) {
				return c.json({ error: 'Invalid email or password', code: 'USER_NOT_FOUND' }, 404);
			}

			// Check account status
			if (user.status === 'deleted') {
				return c.json({ error: 'Account has been deleted', code: 'ACCOUNT_DELETED' }, 403);
			}

			if (user.status === 'suspended') {
				return c.json({ error: 'Account has been suspended. Please contact support.', code: 'ACCOUNT_SUSPENDED' }, 403);
			}

			// Check if account is locked
			if (user.locked_until && new Date(user.locked_until) > new Date() && user.status === 'temporarily_locked') {
				return c.json(
					{
						error: 'Account is temporarily locked. Please reset your password via email.',
						code: 'ACCOUNT_LOCKED',
						lockedUntil: user.locked_until,
					},
					403
				);
			}

			const loginAttemptResult = await passwordService.handleLoginAttempt({ user, passwordAttempt: password }, c);
			if (loginAttemptResult instanceof Error || loginAttemptResult.error) {
				return c.json(
					{
						error: loginAttemptResult instanceof Error ? loginAttemptResult.message : loginAttemptResult.error,
						code: 'LOGIN_ATTEMPT_FAILED',
					},
					401
				);
			}

			const payload = {
				id: user.id,
				exp: Math.floor(Date.now() / 1000) + EXPIRES_IN,
			};

			const token = await jwtService.assignRefreshToken(c, payload);
			if (token instanceof Error) {
				return c.json({ error: token.message, code: 'TOKEN_GENERATION_FAILED' }, 500);
			}

			return c.json<LoginResponse>({
				access_token: token,
				token_type: 'Bearer',
				expires_in: EXPIRES_IN,
			});
		} catch (error) {
			return c.json(
				{
					error: error instanceof Error ? error.message : 'Unknown error',
					code: 'UNEXPECTED_ERROR',
				},
				500
			);
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

		try {
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
				return c.json({ error: 'Invalid verification token', code: 'DB_ERROR' }, 401);
			}

			const tokenData = d1Result.results?.[0] as {
				expires_at: string;
				user_id: string;
			};

			if (!tokenData) {
				return c.json({ error: 'Token expired or already used', code: 'TOKEN_INVALID' }, 401);
			}

			// start a transaction for updating both user status and token usage
			const transaction = db.batch([
				db.prepare('UPDATE users SET status = ?, email_verified = true WHERE id = ?').bind(STATUS_ACTIVE, tokenData.user_id),
				db.prepare('UPDATE verification_tokens SET used_at = CURRENT_TIMESTAMP WHERE token = ?').bind(token),
			]);

			const results = await transaction;
			const [updateUserResult, updateTokenResult] = results;

			if (!updateUserResult.success || !updateTokenResult.success) {
				return c.json({ error: 'Failed to verify email', code: 'TRANSACTION_FAILED' }, 500);
			}

			return c.json<VerifyEmailResponse>({ success: true, message: 'Email verified successfully' });
		} catch (error) {
			return c.json({ error: error instanceof Error ? error.message : 'Unknown error', code: 'UNEXPECTED_ERROR' }, 500);
		}
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
