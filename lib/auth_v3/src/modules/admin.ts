import { Context } from 'hono';
import dbService from './database';
import { createResponse } from '../helpers/createResponse';
import { commonErrorHandler } from '../helpers/commonErrorHandler';

interface AdminResponse {
	success: boolean;
	message: string;
}

interface UserListResponse {
	success: boolean;
	message?: string;
	users?: Array<{
		id: string;
		email: string;
		username: string;
		status: string;
		role: string;
		email_verified: boolean;
		created_at: string;
	}>;
}

const adminService = {
	// promote user to admin role
	promoteUser: async (userId: string, c: Context) => {
		try {
			const result = await dbService.query<AdminResponse>(c, 'UPDATE users SET role = ? WHERE id = ?', ['admin', userId]);
			if (!result.success) {
				return c.json(createResponse(false, 'Failed to promote user', 'ERR_PROMOTE_FAILED'), 500);
			}

			return c.json(createResponse(true, 'User promoted to admin successfully', 'SUCCESS'));
		} catch (error) {
			return commonErrorHandler(error, c);
		}
	},

	// list all users (admin only)
	listUsers: async (c: Context) => {
		try {
			const result = await dbService.query<UserListResponse['users']>(
				c,
				'SELECT id, email, username, status, role, email_verified, created_at FROM users ORDER BY created_at DESC'
			);

			if (!result.success) {
				return c.json(createResponse(false, 'Failed to fetch users', 'ERR_FETCH_USERS_FAILED'), 500);
			}

			return c.json(createResponse(true, 'Users fetched successfully', 'SUCCESS', { users: result.data as UserListResponse['users'] }));
		} catch (error) {
			return commonErrorHandler(error, c);
		}
	},

	// suspend user account
	suspendUser: async (userId: string, c: Context) => {
		try {
			const result = await dbService.query<AdminResponse>(c, 'UPDATE users SET status = ? WHERE id = ?', ['suspended', userId]);

			if (!result.success) {
				return c.json(createResponse(false, 'Failed to suspend user', 'ERR_SUSPEND_FAILED'), 500);
			}

			return c.json(createResponse(true, 'User suspended successfully', 'SUCCESS'));
		} catch (error) {
			return commonErrorHandler(error, c);
		}
	},
};

export default adminService;
