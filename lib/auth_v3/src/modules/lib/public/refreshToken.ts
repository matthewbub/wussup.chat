import { Context } from 'hono';
import jwtService from '../../jwt';
import responseService from '../../response';
import { createResponse } from '../../../helpers/createResponse';
import { commonErrorHandler } from '../../../helpers/commonErrorHandler';
import { codes, errorMessages, httpStatus, tokenConstants } from '../../../constants';
import dbService from '../../database';

export const refreshToken = async ({ refreshToken }: { refreshToken: string }, c: Context) => {
	try {
		responseService.refreshSchema.parse({ refreshToken });

		const refreshTokenResult = await dbService.query<{ results: { expires_at: string; revoked_at: string | null; user_id: string }[] }>(
			c,
			'SELECT * FROM refresh_tokens WHERE token = ?',
			[refreshToken]
		);

		if (!refreshTokenResult.success || !refreshTokenResult.data?.results?.[0]) {
			return createResponse(false, errorMessages.INVALID_REFRESH_TOKEN, codes.INVALID_REFRESH_TOKEN, null, httpStatus.UNAUTHORIZED);
		}

		const tokenData = refreshTokenResult.data.results[0];

		// verify the refresh token
		const isValid = await jwtService.validateTokenAndUser(tokenData, c);
		if (!isValid) {
			return createResponse(false, errorMessages.INVALID_REFRESH_TOKEN, codes.INVALID_REFRESH_TOKEN, null, httpStatus.UNAUTHORIZED);
		}

		// revoke the old refresh token first
		const revoked = await jwtService.revokeRefreshToken(refreshToken, c);
		if (!revoked) {
			return createResponse(false, errorMessages.REVOKE_FAILED, codes.REVOKE_FAILED, null, httpStatus.INTERNAL_SERVER_ERROR);
		}

		const payload = {
			id: tokenData.user_id,
			exp: Math.floor(Date.now() / 1000) + tokenConstants.EXPIRES_IN,
		};

		// create a new access token
		const newToken = await jwtService.assignRefreshToken(c, payload);
		if (newToken instanceof Error) {
			return createResponse(false, newToken.message, codes.TOKEN_GENERATION_ERROR, null, httpStatus.INTERNAL_SERVER_ERROR);
		}

		return createResponse(
			true,
			errorMessages.TOKEN_REFRESHED,
			codes.SUCCESS,
			{
				access_token: newToken,
				token_type: tokenConstants.TYPE,
				expires_in: tokenConstants.EXPIRES_IN,
			},
			httpStatus.OK
		);
	} catch (error) {
		return commonErrorHandler(error, c);
	}
};
