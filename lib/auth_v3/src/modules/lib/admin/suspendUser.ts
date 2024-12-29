import { Context } from 'hono';
import dbService from '../../database';
import { createResponse } from '../../../helpers/createResponse';
import { commonErrorHandler } from '../../../helpers/commonErrorHandler';
import { AdminResponse } from './admin.types';

const suspendUser = async (userId: string, c: Context) => {
	try {
		const result = await dbService.query<AdminResponse>(c, 'UPDATE users SET status = ? WHERE id = ?', ['suspended', userId]);

		if (!result.success) {
			return createResponse(false, 'Failed to suspend user', 'ERR_SUSPEND_FAILED', null, 500);
		}

		return createResponse(true, 'User suspended successfully', 'SUCCESS', null, 200);
	} catch (error) {
		return commonErrorHandler(error, c);
	}
};

export default suspendUser;
