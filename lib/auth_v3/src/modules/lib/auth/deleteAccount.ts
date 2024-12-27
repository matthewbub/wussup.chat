import { Context } from 'hono';
import { env } from 'hono/adapter';
import jwtService from '../../jwt';
import passwordService from '../../password';
import emailService from '../../email';
import { createResponse } from '../../../helpers/createResponse';
import { commonErrorHandler } from '../../../helpers/commonErrorHandler';
import logout from './logout';
import changePassword from './changePassword';
import getCurrentUser from './getCurrentUser';
import updateUser from './updateUser';

interface UpdateUserResponse {
	success: boolean;
	message: string;
	user?: {
		email: string;
		username: string;
		email_verified: boolean;
	};
}

export const deleteAccount = async (token: string, c: Context) => {
	const db = env(c).DB;

	try {
		const payload = await jwtService.decodeToken(token, c);
		if (!payload?.id) {
			return createResponse(false, 'Invalid token', 'ERR_INVALID_TOKEN');
		}

		// Update user status to deleted and revoke all tokens
		const transaction = db.batch([
			db.prepare('UPDATE users SET status = ? WHERE id = ?').bind('deleted', payload.id),
			db.prepare('UPDATE refresh_tokens SET revoked_at = CURRENT_TIMESTAMP WHERE user_id = ? AND revoked_at IS NULL').bind(payload.id),
		]);

		const results = await transaction;
		if (!results.every((result: { success: boolean }) => result.success)) {
			return createResponse(false, 'Failed to delete account', 'ERR_DELETE_FAILED');
		}

		return createResponse(true, 'Account successfully deleted', 'SUCCESS');
	} catch (error) {
		return commonErrorHandler(error, c);
	}
};

export default deleteAccount;
