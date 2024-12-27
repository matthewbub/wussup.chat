import { Context } from 'hono';
import { env } from 'hono/adapter';
import jwtService from '../../jwt';
import { createResponse } from '../../../helpers/createResponse';
import { commonErrorHandler } from '../../../helpers/commonErrorHandler';

export const deleteAccount = async (token: string, c: Context) => {
	const db = env(c).DB;

	try {
		const payload = await jwtService.decodeToken(token, c);
		if (!payload?.id) {
			return createResponse(false, 'Invalid token', 'ERR_INVALID_TOKEN', null, 401);
		}

		// Update user status to deleted and revoke all tokens
		const transaction = db.batch([
			db.prepare('UPDATE users SET status = ? WHERE id = ?').bind('deleted', payload.id),
			db.prepare('UPDATE refresh_tokens SET revoked_at = CURRENT_TIMESTAMP WHERE user_id = ? AND revoked_at IS NULL').bind(payload.id),
		]);

		const results = await transaction;
		if (!results.every((result: { success: boolean }) => result.success)) {
			return createResponse(false, 'Failed to delete account', 'ERR_DELETE_FAILED', null, 500);
		}

		return createResponse(true, 'Account successfully deleted', 'SUCCESS', null, 200);
	} catch (error) {
		return commonErrorHandler(error, c);
	}
};

export default deleteAccount;
