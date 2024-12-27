import { Context } from 'hono';
import { env } from 'hono/adapter';
import jwtService from '../../jwt';
import passwordService from '../../password';
import emailService from '../../email';
import { createResponse } from '../../../helpers/createResponse';
import { commonErrorHandler } from '../../../helpers/commonErrorHandler';
import logout from './logout';
import changePassword from './changePassword';

interface UpdateUserResponse {
	success: boolean;
	message: string;
	user?: {
		email: string;
		username: string;
		email_verified: boolean;
	};
}
export const getCurrentUser = async (token: string, c: Context) => {
	const db = env(c).DB;

	try {
		const payload = await jwtService.decodeToken(token, c);
		if (!payload?.id) {
			return createResponse(false, 'Invalid token', 'ERR_INVALID_TOKEN');
		}

		const userResult = await db
			.prepare(
				`
					SELECT id, email, username, status, role, 
						   email_verified, last_login_at, created_at 
					FROM users 
					WHERE id = ?
				`
			)
			.bind(payload.id)
			.run();

		const user = userResult.results?.[0];

		if (!user) {
			return createResponse(false, 'User not found', 'ERR_USER_NOT_FOUND');
		}

		return createResponse(true, 'User retrieved successfully', 'SUCCESS', user);
	} catch (error) {
		return commonErrorHandler(error, c);
	}
};

export default getCurrentUser;
