import { Context } from 'hono';
import jwtService from '../../jwt';
import { z } from 'zod';
import { createResponse } from '../../../helpers/createResponse';
import { commonErrorHandler } from '../../../helpers/commonErrorHandler';

export const logout = async (token: string, c: Context) => {
	try {
		// zod schema validation
		const schema = z.object({ token: z.string() });
		const validation = schema.safeParse({ token });
		if (!validation.success) {
			return c.json(createResponse(false, 'Invalid token format', 'ERR_INVALID_TOKEN_FORMAT'), 400);
		}

		// revoke the current token
		const revoked = await jwtService.revokeRefreshToken(token, c);
		if (!revoked) {
			return c.json(createResponse(false, 'Failed to logout', 'ERR_LOGOUT_FAILED'), 500);
		}

		return c.json(createResponse(true, 'Successfully logged out', 'SUCCESS'));
	} catch (error) {
		return commonErrorHandler(error, c);
	}
};

export default logout;
