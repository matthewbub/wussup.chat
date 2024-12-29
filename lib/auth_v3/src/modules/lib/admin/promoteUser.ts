import { Context } from 'hono';
import dbService from '../../database';
import { createResponse } from '../../../helpers/createResponse';
import { commonErrorHandler } from '../../../helpers/commonErrorHandler';
import { AdminResponse } from './admin.types';

const promoteUser = async (userId: string, c: Context) => {
	try {
		const result = await dbService.query<AdminResponse>(c, 'UPDATE users SET role = ? WHERE id = ?', ['admin', userId]);
		if (!result.success) {
			return createResponse(false, 'Failed to promote user', 'ERR_PROMOTE_FAILED', null, 500);
		}

		return createResponse(true, 'User promoted to admin successfully', 'SUCCESS', null, 200);
	} catch (error) {
		return commonErrorHandler(error, c);
	}
};

export default promoteUser;
