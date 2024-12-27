import { Context } from 'hono';
import { env } from 'hono/adapter';
import jwtService from './jwt';
import passwordService from './password';
import emailService from './email';
import responseService from './response';
import { signUp } from './lib/signUp';
import { createResponse } from '../helpers/createResponse';
import { commonErrorHandler } from '../helpers/commonErrorHandler';

const EXPIRES_IN = 60 * 60; // 1 hour
const STATUS_ACTIVE = 'active';
interface CommonAuthResponse {
	access_token: string;
	token_type: string;
	expires_in: number;
}

export interface SignUpResponse extends CommonAuthResponse {
	verificationToken?: string; // Optional since it's only included in development
}

export interface LoginResponse extends CommonAuthResponse {}
interface ResendEmailResponse {
	success: boolean;
	message: string;
}

const publicService = {
	signUp: signUp,
	login: async ({ email, password }: { email: string; password: string }, c: Context) => {
		const db = env(c).DB;

		try {
			responseService.loginSchema.parse({ email, password });

			const d1Result: D1Result = await db
				.prepare('SELECT id, password, status, failed_login_attempts, locked_until FROM users WHERE email = ?')
				.bind(email)
				.run();

			if (!d1Result.success) {
				return c.json(createResponse(false, d1Result.error || 'Database error', 'DB_ERROR'), 500);
			}

			const user = d1Result.results?.[0] as {
				id: string;
				password: string;
				status: string;
				failed_login_attempts: number;
				locked_until: string | null;
			};

			if (!user) {
				return c.json(createResponse(false, 'Invalid email or password', 'USER_NOT_FOUND'), 404);
			}

			// check account status
			if (user.status === 'deleted') {
				return c.json(createResponse(false, 'Account has been deleted', 'ACCOUNT_DELETED'), 403);
			}

			if (user.status === 'suspended') {
				return c.json(createResponse(false, 'Account has been suspended. Please contact support.', 'ACCOUNT_SUSPENDED'), 403);
			}

			// check if account is locked
			if (user.locked_until && new Date(user.locked_until) > new Date() && user.status === 'temporarily_locked') {
				return c.json(
					createResponse(false, 'Account is temporarily locked. Please reset your password via email.', 'ACCOUNT_LOCKED', {
						lockedUntil: user.locked_until,
					}),
					403
				);
			}

			const loginAttemptResult = await passwordService.handleLoginAttempt({ user, passwordAttempt: password }, c);
			if (loginAttemptResult instanceof Error || loginAttemptResult.error) {
				return c.json(
					createResponse(
						false,
						loginAttemptResult instanceof Error ? loginAttemptResult.message : loginAttemptResult.error || 'Unknown error',
						'LOGIN_ATTEMPT_FAILED'
					),
					401
				);
			}

			const payload = {
				id: user.id,
				exp: Math.floor(Date.now() / 1000) + EXPIRES_IN,
			};

			const token = await jwtService.assignRefreshToken(c, payload);
			if (token instanceof Error) {
				return c.json(createResponse(false, token.message, 'TOKEN_GENERATION_FAILED'), 500);
			}

			return c.json(
				createResponse(true, 'Login successful', 'SUCCESS', {
					access_token: token,
					token_type: 'Bearer',
					expires_in: EXPIRES_IN,
				})
			);
		} catch (error) {
			return commonErrorHandler(error, c);
		}
	},
	refreshToken: async ({ refreshToken }: { refreshToken: string }, c: Context) => {
		const db = env(c).DB;

		try {
			responseService.refreshSchema.parse({ refreshToken });

			const d1Result: D1Result = await db.prepare('SELECT * FROM refresh_tokens WHERE token = ?').bind(refreshToken).run();

			if (!d1Result.success) {
				return c.json(createResponse(false, 'Invalid refresh token', 'INVALID_REFRESH_TOKEN'), 401);
			}

			const tokenData = d1Result.results?.[0] as { expires_at: string; revoked_at: string | null; user_id: string };
			if (!tokenData) {
				return c.json(createResponse(false, 'Invalid refresh token', 'INVALID_REFRESH_TOKEN'), 401);
			}

			// verify the refresh token
			const isValid = await jwtService.validateTokenAndUser(tokenData, c);
			if (!isValid) {
				return c.json(createResponse(false, 'Invalid refresh token', 'INVALID_REFRESH_TOKEN'), 401);
			}

			// revoke the old refresh token first
			const revoked = await jwtService.revokeRefreshToken(refreshToken, c);
			if (!revoked) {
				return c.json(createResponse(false, 'Failed to revoke refresh token', 'REVOKE_FAILED'), 500);
			}

			const payload = {
				id: tokenData.user_id,
				exp: Math.floor(Date.now() / 1000) + EXPIRES_IN,
			};

			// create a new access token
			const newToken = await jwtService.assignRefreshToken(c, payload);
			if (newToken instanceof Error) {
				return c.json(createResponse(false, newToken.message, 'TOKEN_GENERATION_ERROR'), 500);
			}

			// return the new access token
			return c.json(
				createResponse(true, 'Token refreshed successfully', 'SUCCESS', {
					access_token: newToken,
					token_type: 'Bearer',
					expires_in: EXPIRES_IN,
				})
			);
		} catch (error) {
			return commonErrorHandler(error, c);
		}
	},
	verifyEmail: async ({ token }: { token: string }, c: Context) => {
		const db = env(c).DB;

		try {
			responseService.verifyEmailSchema.parse({ token });

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
				return c.json(createResponse(false, 'Invalid verification token', 'DB_ERROR'), 401);
			}

			const tokenData = d1Result.results?.[0] as {
				expires_at: string;
				user_id: string;
			};

			if (!tokenData) {
				return c.json(createResponse(false, 'Token expired or already used', 'TOKEN_INVALID'), 401);
			}

			// start a transaction for updating both user status and token usage
			const transaction = db.batch([
				db.prepare('UPDATE users SET status = ?, email_verified = true WHERE id = ?').bind(STATUS_ACTIVE, tokenData.user_id),
				db.prepare('UPDATE verification_tokens SET used_at = CURRENT_TIMESTAMP WHERE token = ?').bind(token),
			]);

			const results = await transaction;
			const [updateUserResult, updateTokenResult] = results;

			if (!updateUserResult.success || !updateTokenResult.success) {
				return c.json(createResponse(false, 'Failed to verify email', 'TRANSACTION_FAILED'), 500);
			}

			return c.json(createResponse(true, 'Email verified successfully', 'SUCCESS'));
		} catch (error) {
			return commonErrorHandler(error, c);
		}
	},
	forgotPassword: async ({ email }: { email: string }, c: Context) => {
		try {
			responseService.forgotPasswordSchema.parse({ email });
			const result = await passwordService.initiateReset(email, c);
			return c.json(createResponse(true, 'If a user exists with this email, they will receive reset instructions.', 'SUCCESS', result));
		} catch (error) {
			return commonErrorHandler(error, c);
		}
	},
	resetPassword: async ({ token, password, confirmPassword }: { token: string; password: string; confirmPassword: string }, c: Context) => {
		try {
			responseService.resetPasswordSchema.parse({ token, password, confirmPassword });
			const result = await passwordService.completeReset({ token, newPassword: password }, c);
			return c.json(result);
		} catch (error) {
			return commonErrorHandler(error, c);
		}
	},
	resendVerificationEmail: async ({ email }: { email: string }, c: Context) => {
		const db = env(c).DB;

		try {
			responseService.resendVerificationEmailSchema.parse({ email });

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
			return commonErrorHandler(error, c);
		}
	},
};

export default publicService;
