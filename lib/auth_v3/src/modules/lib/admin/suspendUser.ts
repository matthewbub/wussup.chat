import { Context } from 'hono';
import dbService from '../../database';
import { createResponse } from '../../../helpers/createResponse';
import { commonErrorHandler } from '../../../helpers/commonErrorHandler';
import { AdminResponse } from './admin.types';

const suspendUser = async (userId: string, c: Context) => {
	try {
		const result = await dbService.query<AdminResponse>(c, 'UPDATE users SET status = ? WHERE id = ?', ['suspended', userId]);

		if (!result.success) {
			return c.json(createResponse(false, 'Failed to suspend user', 'ERR_SUSPEND_FAILED'), 500);
		}

		return c.json(createResponse(true, 'User suspended successfully', 'SUCCESS'));
	} catch (error) {
		return commonErrorHandler(error, c);
	}
};

export default suspendUser;
