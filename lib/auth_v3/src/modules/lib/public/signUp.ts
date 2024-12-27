import { Context } from 'hono';
import { env } from 'hono/adapter';
import jwtService from '../../jwt';
import passwordService from '../../password';
import emailService from '../../email';
import responseService from '../../response';
import ERROR_CODES from '../../../constants/errorCodes';
import ERROR_MESSAGES from '../../../constants/errorMessages';
import { createResponse } from '../../../helpers/createResponse';
import { commonErrorHandler } from '../../../helpers/commonErrorHandler';
import dbService from '../../database';
import adminService from '../admin';
const EXPIRES_IN = 60 * 60; // 1 hour
const STATUS_PENDING = 'pending';

export const signUp = async (
	{ email, password, confirmPassword }: { email: string; password: string; confirmPassword: string },
	c: Context
) => {
	const db = env(c).DB;

	try {
		responseService.signUpSchema.parse({ email, password, confirmPassword });

		// if no users, promote this user to admin
		const adminCheckResult = await dbService.query<{ count: number }>(c, 'SELECT COUNT(*) as count FROM users WHERE role = "admin"');
		if (!adminCheckResult.success) {
			return c.json(createResponse(false, 'Failed to check admin count', 'ERR_ADMIN_CHECK_FAILED'), 500);
		}
		const adminCount = adminCheckResult.data?.count || 0;

		// check for existing email
		const existingUserResult = await db.prepare('SELECT id FROM users WHERE email = ?').bind(email).run();
		if (existingUserResult.success && existingUserResult.results?.length) {
			return c.json(createResponse(false, ERROR_MESSAGES.EMAIL_ALREADY_IN_USE, ERROR_CODES.EMAIL_ALREADY_IN_USE), 409);
		}

		const hashedPassword = await passwordService.hashPassword(password);
		const d1Result: D1Result = await db
			.prepare('INSERT INTO users (id, email, username, password, status) VALUES (?, ?, ?, ?, ?) RETURNING id, email, username')
			// we are use the email as the username by default
			// account status is pending til user verifies their email
			.bind(crypto.randomUUID(), email, email, hashedPassword, STATUS_PENDING)
			.run();

		if (!d1Result.success) {
			return c.json(createResponse(false, ERROR_MESSAGES.USER_CREATION_FAILED, ERROR_CODES.USER_CREATION_FAILED, d1Result.error), 500);
		}

		const user = d1Result.results?.[0] as { id: string };
		if (!user) {
			return c.json(createResponse(false, ERROR_MESSAGES.USER_CREATION_FAILED, ERROR_CODES.USER_CREATION_FAILED), 500);
		}

		// if no users, promote this user to admin
		if (adminCount === 0) {
			const adminResult = await adminService.promoteUser(user.id, c);
			if (adminResult instanceof Error) {
				return createResponse(false, 'Failed to promote user', 'ERR_PROMOTE_FAILED');
			}
		}

		// add the password to the password history
		const passwordHistoryResult = await passwordService.addToPasswordHistory({ userId: user.id, passwordHash: hashedPassword }, c);
		if (passwordHistoryResult instanceof Error) {
			return c.json(createResponse(false, ERROR_MESSAGES.PASSWORD_HISTORY_ERROR, ERROR_CODES.PASSWORD_HISTORY_ERROR), 500);
		}

		// this is the point at which we send the initial verification email
		const emailResult = await emailService.sendVerificationEmail({ to: email, user }, c);
		if (emailResult instanceof Error) {
			return c.json(createResponse(false, ERROR_MESSAGES.EMAIL_SEND_ERROR, ERROR_CODES.EMAIL_SEND_ERROR), 500);
		}

		// create a "payload" object
		// were gonna encrypt this and then
		// decrypt it at validation time
		const payload = {
			id: user.id,
			exp: Math.floor(Date.now() / 1000) + EXPIRES_IN,
		};

		// encrypt the payload with an auth key
		// we need the auth key to decrypt at validation time
		const token = await jwtService.assignRefreshToken(c, payload);
		if (token instanceof Error) {
			return c.json(createResponse(false, token.message, ERROR_CODES.TOKEN_GENERATION_ERROR), 500);
		}

		return c.json(
			createResponse(true, ERROR_MESSAGES.SUCCESS, ERROR_CODES.SUCCESS, {
				access_token: token,
				token_type: 'Bearer',
				expires_in: EXPIRES_IN,
				...(env(c).ENV === 'test' && { verificationToken: emailResult.verificationToken }),
			})
		);
	} catch (error) {
		return commonErrorHandler(error, c);
	}
};
