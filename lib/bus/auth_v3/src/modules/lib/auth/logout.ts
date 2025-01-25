import { Context } from 'hono';
import jwtService from '../../jwt';
import { z } from 'zod';
import { createResponse } from '../../../helpers/createResponse';
import { commonErrorHandler } from '../../../helpers/commonErrorHandler';
import { codes, errorMessages, httpStatus } from '../../../constants';

export const logout = async (token: string, c: Context) => {
	try {
		const schema = z.object({ token: z.string() });
		const validation = schema.safeParse({ token });
		if (!validation.success) {
			return createResponse(false, errorMessages.INVALID_TOKEN, codes.ERR_INVALID_TOKEN, null, httpStatus.BAD_REQUEST);
		}

		const revoked = await jwtService.revokeRefreshToken(token, c);
		if (!revoked) {
			return createResponse(false, errorMessages.REVOKE_FAILED, codes.REVOKE_FAILED, null, httpStatus.INTERNAL_SERVER_ERROR);
		}

		return createResponse(true, 'Successfully logged out', codes.SUCCESS, null, httpStatus.OK);
	} catch (error) {
		return commonErrorHandler(error, c);
	}
};

export default logout;
