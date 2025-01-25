import { Context } from 'hono';
import jwtService from '../../jwt';
import passwordService from '../../password';
import { createResponse } from '../../../helpers/createResponse';
import { commonErrorHandler } from '../../../helpers/commonErrorHandler';
import { codes, errorMessages, httpStatus } from '../../../constants';
import dbService from '../../database';

export const changePassword = async ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }, c: Context) => {
	const token = c.req.header('Authorization')?.split(' ')[1];

	if (!token) {
		return createResponse(false, 'Authentication required', 'ERR_AUTH_REQUIRED', null, httpStatus.UNAUTHORIZED);
	}

	try {
		// Get user from the token
		const payload = await jwtService.decodeToken(token, c);
		if (!payload?.id) {
			return createResponse(false, errorMessages.INVALID_TOKEN, codes.ERR_INVALID_TOKEN, null, httpStatus.UNAUTHORIZED);
		}

		// Get user's current password hash
		const userResult = await dbService.query<{ results: [{ id: string; password: string; status: string }] }>(
			c,
			'SELECT id, password, status FROM users WHERE id = ?',
			[payload.id]
		);

		const user = userResult.data?.results?.[0];
		if (!user) {
			return createResponse(false, errorMessages.DATABASE_ERROR, codes.USER_NOT_FOUND, null, httpStatus.NOT_FOUND);
		}

		// Verify current password
		const isCurrentPasswordValid = await passwordService.verifyPassword(user.password, currentPassword);
		if (!isCurrentPasswordValid) {
			return createResponse(false, 'Current password is incorrect', 'ERR_INCORRECT_PASSWORD', null, httpStatus.BAD_REQUEST);
		}

		// Hash new password
		const hashedNewPassword = await passwordService.hashPassword(newPassword);

		// Check if new password was recently used
		const isPasswordReused = await passwordService.isPasswordReused({ userId: user.id, newPasswordHash: hashedNewPassword }, c);

		if (isPasswordReused) {
			return createResponse(false, 'Cannot reuse a recent password', 'ERR_PASSWORD_REUSED', null, httpStatus.BAD_REQUEST);
		}

		// Update password and add to history in a transaction
		const transactionResult = await dbService.transaction(c, [
			{
				sql: 'UPDATE users SET password = ? WHERE id = ?',
				params: [hashedNewPassword, user.id],
			},
			{
				sql: 'INSERT INTO password_history (id, user_id, password_hash) VALUES (?, ?, ?)',
				params: [crypto.randomUUID(), user.id, hashedNewPassword],
			},
		]);

		if (!transactionResult.success) {
			return createResponse(false, errorMessages.UPDATE_FAILED, codes.ERR_UPDATE_FAILED, null, httpStatus.INTERNAL_SERVER_ERROR);
		}

		// Revoke all refresh tokens for this user for security
		await dbService.query(c, 'UPDATE refresh_tokens SET revoked_at = CURRENT_TIMESTAMP WHERE user_id = ? AND revoked_at IS NULL', [
			user.id,
		]);

		return createResponse(true, 'Password changed successfully. Please log in with your new password.', codes.SUCCESS, null, httpStatus.OK);
	} catch (error) {
		return commonErrorHandler(error, c);
	}
};

export default changePassword;
