import { Context } from 'hono';
import { env } from 'hono/adapter';
import jwtService from '../../jwt';
import { createResponse } from '../../../helpers/createResponse';
import { commonErrorHandler } from '../../../helpers/commonErrorHandler';

export const getCurrentUser = async (token: string, c: Context) => {
	const db = env(c).DB;

	try {
		const payload = await jwtService.decodeToken(token, c);
		if (!payload?.id) {
			return createResponse(false, 'Invalid token', 'ERR_INVALID_TOKEN', null, 401);
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
			return createResponse(false, 'User not found', 'ERR_USER_NOT_FOUND', null, 404);
		}

		return createResponse(true, 'User retrieved successfully', 'SUCCESS', user, 200);
	} catch (error) {
		return commonErrorHandler(error, c);
	}
};

export default getCurrentUser;
