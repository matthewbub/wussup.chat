import { Context } from 'hono';
import responseService from '../../response';
import { createResponse } from '../../../helpers/createResponse';
import { commonErrorHandler } from '../../../helpers/commonErrorHandler';
import { codes, errorMessages, httpStatus, userStatuses } from '../../../constants';
import dbService from '../../database';

// token type constant
const EMAIL_TOKEN_TYPE = 'email';

export const verifyEmail = async ({ token }: { token: string }, c: Context) => {
	try {
		responseService.verifyEmailSchema.parse({ token });

		const res = await dbService.query<{ results: { expires_at: string; used_at: string | null; user_id: string }[] }>(
			c,
			`
				SELECT * FROM verification_tokens
				WHERE token = ?
				AND type = ?
				AND used_at IS NULL
				AND expires_at > CURRENT_TIMESTAMP
			`,
			[token, EMAIL_TOKEN_TYPE]
		);

		if (!res.success) {
			return createResponse(
				false,
				errorMessages.INVALID_VERIFICATION_TOKEN,
				codes.INVALID_VERIFICATION_TOKEN,
				null,
				httpStatus.UNAUTHORIZED
			);
		}

		const tokenData = res.data?.results?.[0] as {
			expires_at: string;
			user_id: string;
		};

		if (!tokenData) {
			return createResponse(false, errorMessages.TOKEN_EXPIRED_OR_USED, codes.TOKEN_INVALID, null, httpStatus.UNAUTHORIZED);
		}

		const transaction = await dbService.transaction(c, [
			{
				sql: 'UPDATE users SET status = ?, email_verified = true WHERE id = ?',
				params: [userStatuses.ACTIVE, tokenData.user_id],
			},
			{
				sql: 'UPDATE verification_tokens SET used_at = CURRENT_TIMESTAMP WHERE token = ?',
				params: [token],
			},
		]);

		if (!transaction.success) {
			return createResponse(
				false,
				errorMessages.EMAIL_VERIFICATION_FAILED,
				codes.EMAIL_VERIFICATION_FAILED,
				null,
				httpStatus.INTERNAL_SERVER_ERROR
			);
		}

		return createResponse(true, errorMessages.EMAIL_VERIFIED_SUCCESS, codes.SUCCESS, null, httpStatus.OK);
	} catch (error) {
		return commonErrorHandler(error, c);
	}
};
