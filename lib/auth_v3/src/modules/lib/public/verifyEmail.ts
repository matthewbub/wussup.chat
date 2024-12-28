import { Context } from 'hono';
import responseService from '../../response';
import { createResponse } from '../../../helpers/createResponse';
import { commonErrorHandler } from '../../../helpers/commonErrorHandler';
import dbService from '../../database';
const STATUS_ACTIVE = 'active';

export const verifyEmail = async ({ token }: { token: string }, c: Context) => {
	try {
		responseService.verifyEmailSchema.parse({ token });

		// check for valid token of type 'email' that hasn't been used and hasn't expired
		const res = await dbService.query<{ results: { expires_at: string; used_at: string | null; user_id: string }[] }>(
			c,
			`
					SELECT * FROM verification_tokens
					WHERE token = ?
					AND type = 'email'
					AND used_at IS NULL
					AND expires_at > CURRENT_TIMESTAMP
				`,
			[token]
		);

		if (!res.success) {
			return createResponse(false, 'Invalid verification token', 'DB_ERROR', null, 401);
		}

		const tokenData = res.data?.results?.[0] as {
			expires_at: string;
			user_id: string;
		};

		if (!tokenData) {
			return createResponse(false, 'Token expired or already used', 'TOKEN_INVALID', null, 401);
		}

		// start a transaction for updating both user status and token usage
		const transaction = await dbService.transaction(c, [
			{
				sql: 'UPDATE users SET status = ?, email_verified = true WHERE id = ?',
				params: [STATUS_ACTIVE, tokenData.user_id],
			},
			{
				sql: 'UPDATE verification_tokens SET used_at = CURRENT_TIMESTAMP WHERE token = ?',
				params: [token],
			},
		]);

		if (!transaction.success) {
			return createResponse(false, 'Failed to verify email', 'TRANSACTION_FAILED', null, 500);
		}

		return createResponse(true, 'Email verified successfully', 'SUCCESS', null, 200);
	} catch (error) {
		return commonErrorHandler(error, c);
	}
};
