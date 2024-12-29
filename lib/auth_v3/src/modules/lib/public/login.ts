import { Context } from 'hono';
import jwtService from '../../jwt';
import passwordService from '../../password';
import responseService from '../../response';
import { createResponse } from '../../../helpers/createResponse';
import { commonErrorHandler } from '../../../helpers/commonErrorHandler';
import { codes, errorMessages, httpStatus, userStatuses, tokenConstants } from '../../../constants';
import dbService from '../../database';

export const login = async ({ email, password }: { email: string; password: string }, c: Context) => {
	try {
		responseService.loginSchema.parse({ email, password });

		const userResult = await dbService.query<{
			results: {
				id: string;
				password: string;
				status: string;
				failed_login_attempts: number;
				locked_until: string | null;
			}[];
		}>(c, 'SELECT id, password, status, failed_login_attempts, locked_until FROM users WHERE email = ?', [email]);

		if (!userResult.success) {
			return createResponse(false, errorMessages.DATABASE_ERROR, codes.DB_ERROR, null, httpStatus.INTERNAL_SERVER_ERROR);
		}

		const user = userResult.data?.results?.[0];

		if (!user) {
			return createResponse(false, errorMessages.LOGIN_FAILED, codes.LOGIN_FAILED, null, httpStatus.UNAUTHORIZED);
		}

		// check account status
		if (user.status === userStatuses.DELETED) {
			return createResponse(false, errorMessages.ACCOUNT_DELETED, codes.ACCOUNT_DELETED, null, httpStatus.FORBIDDEN);
		}

		if (user.status === userStatuses.SUSPENDED) {
			return createResponse(false, errorMessages.ACCOUNT_SUSPENDED, codes.ACCOUNT_SUSPENDED, null, httpStatus.FORBIDDEN);
		}

		// check if account is locked
		if (user.locked_until && new Date(user.locked_until) > new Date() && user.status === userStatuses.TEMPORARILY_LOCKED) {
			return createResponse(
				false,
				errorMessages.ACCOUNT_LOCKED,
				codes.ACCOUNT_LOCKED,
				{
					lockedUntil: user.locked_until,
				},
				httpStatus.FORBIDDEN
			);
		}

		const loginAttemptResult = await passwordService.handleLoginAttempt({ user, passwordAttempt: password }, c);
		if (loginAttemptResult instanceof Error || loginAttemptResult.error) {
			return createResponse(
				false,
				loginAttemptResult instanceof Error ? loginAttemptResult.message : loginAttemptResult.error || errorMessages.LOGIN_FAILED,
				codes.LOGIN_FAILED,
				{
					lockedUntil: user.locked_until,
				},
				httpStatus.UNAUTHORIZED
			);
		}

		const payload = {
			id: user.id,
			exp: Math.floor(Date.now() / 1000) + tokenConstants.EXPIRES_IN,
		};

		const token = await jwtService.assignRefreshToken(c, payload);
		if (token instanceof Error) {
			return createResponse(false, token.message, codes.TOKEN_GENERATION_ERROR, null, httpStatus.INTERNAL_SERVER_ERROR);
		}

		return createResponse(
			true,
			errorMessages.LOGIN_SUCCESS,
			codes.SUCCESS,
			{
				access_token: token,
				token_type: tokenConstants.TYPE,
				expires_in: tokenConstants.EXPIRES_IN,
			},
			httpStatus.OK
		);
	} catch (error) {
		return commonErrorHandler(error, c);
	}
};
