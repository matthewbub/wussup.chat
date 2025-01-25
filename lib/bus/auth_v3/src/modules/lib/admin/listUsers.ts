import { Context } from 'hono';
import dbService from '../../database';
import { createResponse } from '../../../helpers/createResponse';
import { commonErrorHandler } from '../../../helpers/commonErrorHandler';
import { AdminResponse } from './admin.types';

const listUsers = async (c: Context) => {
	try {
		const result = await dbService.query<AdminResponse>(
			c,
			'SELECT id, email, username, status, role, email_verified, created_at FROM users ORDER BY created_at DESC'
		);

		if (!result.success) {
			return createResponse(false, 'Failed to list users', 'ERR_LIST_USERS_FAILED', null, 500);
		}

		return createResponse(true, 'Users listed successfully', 'SUCCESS', result.data, 200);
	} catch (error) {
		return commonErrorHandler(error, c);
	}
};

export default listUsers;
