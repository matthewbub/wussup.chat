import { Context } from 'hono';
import { env } from 'hono/adapter';
import jwtService from '../../jwt';
import { createResponse } from '../../../helpers/createResponse';
import { commonErrorHandler } from '../../../helpers/commonErrorHandler';
import { codes, errorMessages, httpStatus } from '../../../constants';
import { ipRestriction } from 'hono/ip-restriction';

export const getCurrentUser = async (token: string, c: Context) => {
	const db = env(c).DB;

	try {
		const payload = await jwtService.decodeToken(token, c);
		if (!payload?.id) {
			return createResponse(false, errorMessages.INVALID_TOKEN, codes.ERR_INVALID_TOKEN, null, httpStatus.UNAUTHORIZED);
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
			return createResponse(false, errorMessages.DATABASE_ERROR, codes.USER_NOT_FOUND, null, httpStatus.NOT_FOUND);
		}

		// Add status check
		if (user.status !== 'active') {
			if (user.status === 'inactive') {
				return createResponse(false, errorMessages.ACCOUNT_INACTIVE, codes.ACCOUNT_INACTIVE, null, httpStatus.FORBIDDEN);
			}
			if (user.status === 'suspended') {
				return createResponse(false, errorMessages.ACCOUNT_SUSPENDED, codes.ACCOUNT_SUSPENDED, null, httpStatus.FORBIDDEN);
			}
			if (user.status === 'locked') {
				return createResponse(false, errorMessages.ACCOUNT_LOCKED, codes.ACCOUNT_LOCKED, null, httpStatus.FORBIDDEN);
			}
			if (user.status === 'deleted') {
				return createResponse(false, errorMessages.ACCOUNT_DELETED, codes.ACCOUNT_DELETED, null, httpStatus.FORBIDDEN);
			}
			if (user.status === 'pending') {
				return createResponse(false, errorMessages.ACCOUNT_PENDING, codes.ACCOUNT_PENDING, null, httpStatus.FORBIDDEN);
			}
		}

		return createResponse(true, 'User retrieved successfully', codes.SUCCESS, user, httpStatus.OK);
	} catch (error) {
		return commonErrorHandler(error, c);
	}
};

export default getCurrentUser;
