import { Context } from 'hono';
import jwtService from '../../jwt';
import { z } from 'zod';
import { createResponse } from '../../../helpers/createResponse';
import { commonErrorHandler } from '../../../helpers/commonErrorHandler';

export const logout = async (token: string, c: Context) => {
	try {
		const schema = z.object({ token: z.string() });
		const validation = schema.safeParse({ token });
		if (!validation.success) {
			return createResponse(false, 'Invalid token format', 'ERR_INVALID_TOKEN_FORMAT', null, 400);
		}

		// revoke the current token
		const revoked = await jwtService.revokeRefreshToken(token, c);
		if (!revoked) {
			return createResponse(false, 'Failed to logout', 'ERR_LOGOUT_FAILED', null, 500);
		}

		return createResponse(true, 'Successfully logged out', 'SUCCESS', null, 200);
	} catch (error) {
		return commonErrorHandler(error, c);
	}
};

export default logout;
