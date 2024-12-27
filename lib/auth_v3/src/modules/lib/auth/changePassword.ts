import { Context } from 'hono';
import { env } from 'hono/adapter';
import jwtService from '../../jwt';
import passwordService from '../../password';
import { createResponse } from '../../../helpers/createResponse';
import { commonErrorHandler } from '../../../helpers/commonErrorHandler';

export const changePassword = async ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }, c: Context) => {
	const db = env(c).DB;
	const token = c.req.header('Authorization')?.split(' ')[1];

	if (!token) {
		return createResponse(false, 'Authentication required', 'ERR_AUTH_REQUIRED', null, 401);
	}

	try {
		// Get user from the token
		const payload = await jwtService.decodeToken(token, c);
		if (!payload?.id) {
			return createResponse(false, 'Invalid token', 'ERR_INVALID_TOKEN', null, 401);
		}

		// Get user's current password hash
		const userResult = await db.prepare('SELECT id, password, status FROM users WHERE id = ?').bind(payload.id).run();

		const user = userResult.results?.[0] as { id: string; password: string; status: string };
		if (!user) {
			return createResponse(false, 'User not found', 'ERR_USER_NOT_FOUND', null, 404);
		}

		// Verify current password
		const isCurrentPasswordValid = await passwordService.verifyPassword(user.password, currentPassword);
		if (!isCurrentPasswordValid) {
			return createResponse(false, 'Current password is incorrect', 'ERR_INCORRECT_PASSWORD', null, 400);
		}

		// Hash new password
		const hashedNewPassword = await passwordService.hashPassword(newPassword);

		// Check if new password was recently used
		const isPasswordReused = await passwordService.isPasswordReused({ userId: user.id, newPasswordHash: hashedNewPassword }, c);

		if (isPasswordReused) {
			return createResponse(false, 'Cannot reuse a recent password', 'ERR_PASSWORD_REUSED', null, 400);
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
			return createResponse(false, 'Failed to update password', 'ERR_UPDATE_FAILED', null, 500);
		}

		// Revoke all refresh tokens for this user for security
		await db
			.prepare('UPDATE refresh_tokens SET revoked_at = CURRENT_TIMESTAMP WHERE user_id = ? AND revoked_at IS NULL')
			.bind(user.id)
			.run();

		return createResponse(true, 'Password changed successfully. Please log in with your new password.', 'SUCCESS', null, 200);
	} catch (error) {
		return commonErrorHandler(error, c);
	}
};

export default changePassword;
