import { Context } from 'hono';
import { env } from 'hono/adapter';
import jwtService from '../../jwt';
import { createResponse } from '../../../helpers/createResponse';
import { commonErrorHandler } from '../../../helpers/commonErrorHandler';
import { codes, errorMessages, httpStatus, userStatuses } from '../../../constants';

export const deleteAccount = async (token: string, c: Context) => {
	const db = env(c).DB;

	try {
		const payload = await jwtService.decodeToken(token, c);
		if (!payload?.id) {
			return createResponse(false, errorMessages.INVALID_TOKEN, codes.ERR_INVALID_TOKEN, null, httpStatus.UNAUTHORIZED);
		}

		// Update user status to deleted and revoke all tokens
		const transaction = db.batch([
			db.prepare('UPDATE users SET status = ? WHERE id = ?').bind(userStatuses.DELETED, payload.id),
			db.prepare('UPDATE refresh_tokens SET revoked_at = CURRENT_TIMESTAMP WHERE user_id = ? AND revoked_at IS NULL').bind(payload.id),
		]);

		const results = await transaction;
		if (!results.every((result: { success: boolean }) => result.success)) {
			return createResponse(false, errorMessages.UPDATE_FAILED, codes.ERR_UPDATE_FAILED, null, httpStatus.INTERNAL_SERVER_ERROR);
		}

		return createResponse(true, errorMessages.ACCOUNT_DELETED, codes.SUCCESS, null, httpStatus.OK);
	} catch (error) {
		return commonErrorHandler(error, c);
	}
};

export default deleteAccount;
