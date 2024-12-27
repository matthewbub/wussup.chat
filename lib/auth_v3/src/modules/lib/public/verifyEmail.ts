import { Context } from 'hono';
import { env } from 'hono/adapter';
import responseService from '../../response';
import { createResponse } from '../../../helpers/createResponse';
import { commonErrorHandler } from '../../../helpers/commonErrorHandler';
const STATUS_ACTIVE = 'active';

export const verifyEmail = async ({ token }: { token: string }, c: Context) => {
	const db = env(c).DB;

	try {
		responseService.verifyEmailSchema.parse({ token });

		// check for valid token of type 'email' that hasn't been used and hasn't expired
		const d1Result: D1Result = await db
			.prepare(
				`
					SELECT * FROM verification_tokens
					WHERE token = ?
					AND type = 'email'
					AND used_at IS NULL
					AND expires_at > CURRENT_TIMESTAMP
				`
			)
			.bind(token)
			.run();

		if (!d1Result.success) {
			return c.json(createResponse(false, 'Invalid verification token', 'DB_ERROR'), 401);
		}

		const tokenData = d1Result.results?.[0] as {
			expires_at: string;
			user_id: string;
		};

		if (!tokenData) {
			return c.json(createResponse(false, 'Token expired or already used', 'TOKEN_INVALID'), 401);
		}

		// start a transaction for updating both user status and token usage
		const transaction = db.batch([
			db.prepare('UPDATE users SET status = ?, email_verified = true WHERE id = ?').bind(STATUS_ACTIVE, tokenData.user_id),
			db.prepare('UPDATE verification_tokens SET used_at = CURRENT_TIMESTAMP WHERE token = ?').bind(token),
		]);

		const results = await transaction;
		const [updateUserResult, updateTokenResult] = results;

		if (!updateUserResult.success || !updateTokenResult.success) {
			return c.json(createResponse(false, 'Failed to verify email', 'TRANSACTION_FAILED'), 500);
		}

		return c.json(createResponse(true, 'Email verified successfully', 'SUCCESS'));
	} catch (error) {
		return commonErrorHandler(error, c);
	}
};
