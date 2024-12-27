import { Context } from 'hono';
import { env } from 'hono/adapter';
import jwtService from './jwt';
import passwordService from './password';
import emailService from './email';
import { z } from 'zod';
import { createResponse } from '../helpers/createResponse';
import { commonErrorHandler } from '../helpers/commonErrorHandler';
import { zValidator } from '@hono/zod-validator';

interface LogoutResponse {
	success: boolean;
	message: string;
}

interface ChangePasswordResponse {
	success: boolean;
	message: string;
}

interface UserResponse {
	success: boolean;
	message?: string;
	user?: {
		id: string;
		email: string;
		username: string;
		status: string;
		role: string;
		email_verified: boolean;
		last_login_at: string | null;
		created_at: string;
	};
}

interface UpdateUserResponse {
	success: boolean;
	message: string;
	user?: {
		email: string;
		username: string;
		email_verified: boolean;
	};
}

interface DeleteAccountResponse {
	success: boolean;
	message: string;
}

const authService = {
	logout: async (token: string, c: Context) => {
		const db = env(c).DB;
		try {
			// zod schema validation
			const schema = z.object({ token: z.string() });
			const validation = schema.safeParse({ token });
			if (!validation.success) {
				return c.json(createResponse(false, 'Invalid token format', 'ERR_INVALID_TOKEN_FORMAT'), 400);
			}

			// revoke the current token
			const revoked = await jwtService.revokeRefreshToken(token, c);
			if (!revoked) {
				return c.json(createResponse(false, 'Failed to logout', 'ERR_LOGOUT_FAILED'), 500);
			}

			return c.json(createResponse(true, 'Successfully logged out', 'SUCCESS'));
		} catch (error) {
			return commonErrorHandler(error, c);
		}
	},

	changePassword: async ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }, c: Context) => {
		const db = env(c).DB;
		const token = c.req.header('Authorization')?.split(' ')[1];

		if (!token) {
			return c.json(createResponse(false, 'Authentication required', 'ERR_AUTH_REQUIRED'), 401);
		}

		try {
			// Get user from the token
			const payload = await jwtService.decodeToken(token, c);
			if (!payload?.id) {
				return c.json(createResponse(false, 'Invalid token', 'ERR_INVALID_TOKEN'), 401);
			}

			// Get user's current password hash
			const userResult = await db.prepare('SELECT id, password, status FROM users WHERE id = ?').bind(payload.id).run();

			const user = userResult.results?.[0] as { id: string; password: string; status: string };
			if (!user) {
				return c.json(createResponse(false, 'User not found', 'ERR_USER_NOT_FOUND'), 404);
			}

			// Verify current password
			const isCurrentPasswordValid = await passwordService.verifyPassword(user.password, currentPassword);
			if (!isCurrentPasswordValid) {
				return c.json(createResponse(false, 'Current password is incorrect', 'ERR_INCORRECT_PASSWORD'), 400);
			}

			// Hash new password
			const hashedNewPassword = await passwordService.hashPassword(newPassword);

			// Check if new password was recently used
			const isPasswordReused = await passwordService.isPasswordReused({ userId: user.id, newPasswordHash: hashedNewPassword }, c);

			if (isPasswordReused) {
				return c.json(createResponse(false, 'Cannot reuse a recent password', 'ERR_PASSWORD_REUSED'), 400);
			}

			// Update password and add to history in a transaction
			const transaction = db.batch([
				db.prepare('UPDATE users SET password = ? WHERE id = ?').bind(hashedNewPassword, user.id),
				db
					.prepare('INSERT INTO password_history (id, user_id, password_hash) VALUES (?, ?, ?)')
					.bind(crypto.randomUUID(), user.id, hashedNewPassword),
			]);

			const results = await transaction;
			if (!results.every((result: { success: boolean }) => result.success)) {
				return c.json(createResponse(false, 'Failed to update password', 'ERR_UPDATE_FAILED'), 500);
			}

			// Revoke all refresh tokens for this user for security
			await db
				.prepare('UPDATE refresh_tokens SET revoked_at = CURRENT_TIMESTAMP WHERE user_id = ? AND revoked_at IS NULL')
				.bind(user.id)
				.run();

			return c.json(createResponse(true, 'Password changed successfully. Please log in with your new password.', 'SUCCESS'));
		} catch (error) {
			return commonErrorHandler(error, c);
		}
	},

	getCurrentUser: async (token: string, c: Context) => {
		const db = env(c).DB;

		try {
			const payload = await jwtService.decodeToken(token, c);
			if (!payload?.id) {
				return c.json(createResponse(false, 'Invalid token', 'ERR_INVALID_TOKEN'), 401);
			}

			const userResult = await db
				.prepare(
					`
					SELECT id, email, username, status, role, 
						   email_verified, last_login_at, created_at 
					FROM users 
					WHERE id = ?
				`
				)
				.bind(payload.id)
				.run();

			const user = userResult.results?.[0];
			if (!user) {
				return c.json(createResponse(false, 'User not found', 'ERR_USER_NOT_FOUND'), 404);
			}

			return c.json(createResponse(true, 'User retrieved successfully', 'SUCCESS', { user }));
		} catch (error) {
			return commonErrorHandler(error, c);
		}
	},

	updateUser: async (token: string, updates: { email?: string; username?: string }, c: Context) => {
		const db = env(c).DB;

		try {
			// Decode the token to extract user information
			const payload = await jwtService.decodeToken(token, c);
			if (!payload?.id) {
				return c.json(createResponse(false, 'Invalid token', 'ERR_INVALID_TOKEN'), 401);
			}

			const transaction = [];
			const updates_array = [];

			// Check if a username update is requested
			if (updates.username) {
				const existingUsername = await db
					.prepare('SELECT id FROM users WHERE username = ? AND id != ?')
					.bind(updates.username, payload.id)
					.run();

				if (existingUsername.results?.length) {
					return c.json(createResponse(false, 'Username already taken', 'ERR_USERNAME_TAKEN'), 409);
				}

				updates_array.push('username = ?');
			}

			// Check if an email update is requested
			if (updates.email) {
				const existingEmail = await db.prepare('SELECT id FROM users WHERE email = ? AND id != ?').bind(updates.email, payload.id).run();

				if (existingEmail.results?.length) {
					return c.json(createResponse(false, 'Email already registered', 'ERR_EMAIL_REGISTERED'), 409);
				}

				updates_array.push('email = ?');

				const verificationToken = crypto.randomUUID();
				transaction.push(
					db
						.prepare('INSERT INTO verification_tokens (token, user_id, type, expires_at) VALUES (?, ?, ?, ?)')
						.bind(verificationToken, payload.id, 'email', new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString())
				);
			}

			const updateQuery = `
            UPDATE users 
            SET ${updates_array.join(', ')}
            WHERE id = ?
            RETURNING email, username
        `;

			const bindParams = [];
			if (updates.username) bindParams.push(updates.username);
			if (updates.email) {
				bindParams.push(updates.email);
			}
			bindParams.push(payload.id);

			transaction.push(db.prepare(updateQuery).bind(...bindParams));

			const results = await db.batch(transaction);

			if (!results.every((result: { success: boolean }) => result.success)) {
				return c.json(createResponse(false, 'Failed to update user information', 'ERR_UPDATE_FAILED'), 500);
			}

			const updatedUser = results[results.length - 1].results?.[0] as UpdateUserResponse['user'];

			if (updates.email) {
				await emailService.sendVerificationEmail(
					{
						to: updates.email,
						user: { id: payload.id },
					},
					c
				);
			}

			return c.json(
				createResponse(
					true,
					updates.email ? 'Profile updated. Please verify your new email address.' : 'Profile updated successfully',
					'SUCCESS',
					{ user: updatedUser }
				)
			);
		} catch (error) {
			return commonErrorHandler(error, c);
		}
	},

	deleteAccount: async (token: string, c: Context) => {
		const db = env(c).DB;

		try {
			const payload = await jwtService.decodeToken(token, c);
			if (!payload?.id) {
				return c.json(createResponse(false, 'Invalid token', 'ERR_INVALID_TOKEN'), 401);
			}

			// Update user status to deleted and revoke all tokens
			const transaction = db.batch([
				db.prepare('UPDATE users SET status = ? WHERE id = ?').bind('deleted', payload.id),
				db.prepare('UPDATE refresh_tokens SET revoked_at = CURRENT_TIMESTAMP WHERE user_id = ? AND revoked_at IS NULL').bind(payload.id),
			]);

			const results = await transaction;
			if (!results.every((result: { success: boolean }) => result.success)) {
				return c.json(createResponse(false, 'Failed to delete account', 'ERR_DELETE_FAILED'), 500);
			}

			return c.json(createResponse(true, 'Account successfully deleted', 'SUCCESS'));
		} catch (error) {
			return commonErrorHandler(error, c);
		}
	},

	// Helper method to check user status
	validateUserStatus: async (userId: string, c: Context): Promise<boolean> => {
		const db = env(c).DB;

		try {
			const userResult = await db.prepare('SELECT status FROM users WHERE id = ?').bind(userId).run();

			const user = userResult.results?.[0] as { status: string };
			if (!user) return false;

			return !['deleted', 'suspended'].includes(user.status);
		} catch {
			return false;
		}
	},
};

export default authService;
