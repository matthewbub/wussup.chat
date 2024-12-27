import { Context } from 'hono';
import { env } from 'hono/adapter';
import emailService from '../../email';
import responseService from '../../response';
import { createResponse } from '../../../helpers/createResponse';
import { commonErrorHandler } from '../../../helpers/commonErrorHandler';

const STATUS_ACTIVE = 'active';

export const resendVerificationEmail = async ({ email }: { email: string }, c: Context) => {
	const db = env(c).DB;

	try {
		responseService.resendVerificationEmailSchema.parse({ email });

		// find the user and verify they exist and are still pending
		const userResult = await db.prepare('SELECT id, email, status FROM users WHERE email = ?').bind(email).run();

		if (!userResult.success) {
			return createResponse(false, 'Database error while looking up user', 'DB_ERROR', null, 500);
		}

		const user = userResult.results?.[0] as { id: string; email: string; status: string } | undefined;

		if (!user) {
			return createResponse(false, 'If a matching account was found, a verification email has been sent.', 'USER_NOT_FOUND', null, 404);
		}

		// check if user is already verified
		if (user.status === STATUS_ACTIVE) {
			return createResponse(false, 'Email is already verified', 'EMAIL_ALREADY_VERIFIED', null, 409);
		}

		// check if user is pending
		const allowedStatuses = ['pending'];
		if (!allowedStatuses.includes(user.status)) {
			return createResponse(false, 'Unable to resend verification email', 'UNABLE_TO_RESEND', null, 401);
		}

		// check for rate limiting (optional but recommended)
		const lastEmailResult = await db
			.prepare(
				`
					SELECT created_at
					FROM verification_tokens
					WHERE user_id = ?
					AND type = 'email'
					ORDER BY created_at DESC
					LIMIT 1
				`
			)
			.bind(user.id)
			.run();

		if (lastEmailResult.success && lastEmailResult.results?.[0]) {
			const lastSent = new Date(lastEmailResult.results[0].created_at);
			const timeSinceLastEmail = Date.now() - lastSent.getTime();
			const MIN_RESEND_INTERVAL = 5 * 60 * 1000; // 5 minutes

			if (timeSinceLastEmail < MIN_RESEND_INTERVAL) {
				return createResponse(
					false,
					'Please wait 5 minutes before requesting another verification email',
					'RATE_LIMIT_EXCEEDED',
					null,
					401
				);
			}
		}

		// send new verification email
		const emailResult = await emailService.sendVerificationEmail({ to: email, user }, c);
		if (emailResult instanceof Error) {
			return createResponse(false, 'Failed to send verification email', 'EMAIL_SEND_FAILED', null, 500);
		}

		return createResponse(true, 'Verification email has been resent', 'SUCCESS', null, 200);
	} catch (error) {
		return commonErrorHandler(error, c);
	}
};
