import { Context } from 'hono';
import emailService from '../../email';
import responseService from '../../response';
import { createResponse } from '../../../helpers/createResponse';
import { commonErrorHandler } from '../../../helpers/commonErrorHandler';
import { codes, errorMessages, httpStatus, userStatuses, timing } from '../../../constants';
import dbService from '../../database';

export const resendVerificationEmail = async ({ email }: { email: string }, c: Context) => {
	try {
		responseService.resendVerificationEmailSchema.parse({ email });

		const userResult = await dbService.query<{ results: { id: string; email: string; status: string; app_id: string }[] }>(
			c,
			'SELECT id, email, status, app_id FROM users WHERE email = ?',
			[email]
		);

		if (!userResult.success) {
			return createResponse(false, errorMessages.DATABASE_ERROR, codes.DB_ERROR, null, httpStatus.INTERNAL_SERVER_ERROR);
		}

		const user = userResult.data?.results?.[0];

		if (!user) {
			return createResponse(false, errorMessages.VERIFICATION_EMAIL_SENT, codes.USER_NOT_FOUND, null, httpStatus.NOT_FOUND);
		}

		if (user.status === userStatuses.ACTIVE) {
			return createResponse(false, errorMessages.EMAIL_ALREADY_VERIFIED, codes.EMAIL_ALREADY_VERIFIED, null, httpStatus.CONFLICT);
		}

		const allowedStatuses = [userStatuses.PENDING];
		if (!allowedStatuses.includes(user.status)) {
			return createResponse(false, errorMessages.UNABLE_TO_RESEND, codes.UNABLE_TO_RESEND, null, httpStatus.UNAUTHORIZED);
		}

		const lastEmailResult = await dbService.query<{ results: { created_at: string }[] }>(
			c,
			`
				SELECT created_at
				FROM verification_tokens
				WHERE user_id = ?
				AND type = 'email'
				ORDER BY created_at DESC
				LIMIT 1
			`,
			[user.id]
		);

		if (lastEmailResult.success && lastEmailResult.data?.results?.[0]) {
			const lastSent = new Date(lastEmailResult.data.results[0].created_at);
			const timeSinceLastEmail = Date.now() - lastSent.getTime();

			if (timeSinceLastEmail < timing.VERIFICATION_EMAIL_COOLDOWN) {
				return createResponse(false, errorMessages.RATE_LIMIT_MESSAGE, codes.RATE_LIMIT_EXCEEDED, null, httpStatus.UNAUTHORIZED);
			}
		}

		const emailResult = await emailService.sendVerificationEmail({ to: email, user, appId: user.app_id }, c);
		if (emailResult instanceof Error) {
			return createResponse(false, errorMessages.EMAIL_SEND_FAILED, codes.EMAIL_SEND_FAILED, null, httpStatus.INTERNAL_SERVER_ERROR);
		}

		return createResponse(true, errorMessages.VERIFICATION_EMAIL_SUCCESS, codes.SUCCESS, null, httpStatus.OK);
	} catch (error) {
		return commonErrorHandler(error, c);
	}
};
