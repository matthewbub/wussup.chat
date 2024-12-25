import { Context } from 'hono';
import { env } from 'hono/adapter';

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
	promoteUser: async (userId: string, c: Context): Promise<AdminResponse> => {
		const db = env(c).DB;
		try {
			const result = await db.prepare('UPDATE users SET role = ? WHERE id = ?').bind('admin', userId).run();

			if (!result.success) {
				return {
					success: false,
					message: 'Failed to promote user',
				};
			}

			return {
				success: true,
				message: 'User promoted to admin successfully',
			};
		} catch (error) {
			return {
				success: false,
				message: error instanceof Error ? error.message : 'Unknown error',
			};
		}
	},

	// list all users (admin only)
	listUsers: async (c: Context): Promise<UserListResponse> => {
		const db = env(c).DB;
		try {
			const result = await db
				.prepare(
					`
          SELECT id, email, username, status, role, 
                 email_verified, created_at
          FROM users
          ORDER BY created_at DESC
        `
				)
				.run();

			if (!result.success) {
				return {
					success: false,
					message: 'Failed to fetch users',
				};
			}

			return {
				success: true,
				users: result.results as UserListResponse['users'],
			};
		} catch (error) {
			return {
				success: false,
				message: error instanceof Error ? error.message : 'Unknown error',
			};
		}
	},

	// suspend user account
	suspendUser: async (userId: string, c: Context): Promise<AdminResponse> => {
		const db = env(c).DB;
		try {
			const result = await db.prepare('UPDATE users SET status = ? WHERE id = ?').bind('suspended', userId).run();

			if (!result.success) {
				return {
					success: false,
					message: 'Failed to suspend user',
				};
			}

			return {
				success: true,
				message: 'User suspended successfully',
			};
		} catch (error) {
			return {
				success: false,
				message: error instanceof Error ? error.message : 'Unknown error',
			};
		}
	},
};

export default adminService;
