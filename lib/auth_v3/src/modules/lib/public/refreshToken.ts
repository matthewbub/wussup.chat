import { Context } from 'hono';
import { env } from 'hono/adapter';
import jwtService from '../../jwt';
import responseService from '../../response';
import { createResponse } from '../../../helpers/createResponse';
import { commonErrorHandler } from '../../../helpers/commonErrorHandler';

const EXPIRES_IN = 60 * 60; // 1 hour

export const refreshToken = async ({ refreshToken }: { refreshToken: string }, c: Context) => {
	const db = env(c).DB;

	try {
		responseService.refreshSchema.parse({ refreshToken });

		const d1Result: D1Result = await db.prepare('SELECT * FROM refresh_tokens WHERE token = ?').bind(refreshToken).run();

		if (!d1Result.success) {
			return createResponse(false, 'Invalid refresh token', 'INVALID_REFRESH_TOKEN', null, 401);
		}

		const tokenData = d1Result.results?.[0] as { expires_at: string; revoked_at: string | null; user_id: string };
		if (!tokenData) {
			return createResponse(false, 'Invalid refresh token', 'INVALID_REFRESH_TOKEN', null, 401);
		}

		// verify the refresh token
		const isValid = await jwtService.validateTokenAndUser(tokenData, c);
		if (!isValid) {
			return createResponse(false, 'Invalid refresh token', 'INVALID_REFRESH_TOKEN', null, 401);
		}

		// revoke the old refresh token first
		const revoked = await jwtService.revokeRefreshToken(refreshToken, c);
		if (!revoked) {
			return createResponse(false, 'Failed to revoke refresh token', 'REVOKE_FAILED', null, 500);
		}

		const payload = {
			id: tokenData.user_id,
			exp: Math.floor(Date.now() / 1000) + EXPIRES_IN,
		};

		// create a new access token
		const newToken = await jwtService.assignRefreshToken(c, payload);
		if (newToken instanceof Error) {
			return createResponse(false, newToken.message, 'TOKEN_GENERATION_ERROR', null, 500);
		}

		// return the new access token
		return createResponse(
			true,
			'Token refreshed successfully',
			'SUCCESS',
			{
				access_token: newToken,
				token_type: 'Bearer',
				expires_in: EXPIRES_IN,
			},
			200
		);
	} catch (error) {
		return commonErrorHandler(error, c);
	}
};
