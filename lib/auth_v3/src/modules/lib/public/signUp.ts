import { Context } from 'hono';
import { env } from 'hono/adapter';
import jwtService from '../../jwt';
import passwordService from '../../password';
import emailService from '../../email';
import responseService from '../../response';
import { codes, errorMessages, httpStatus, testEnv, userStatuses, tokenConstants } from '../../../constants';
import { createResponse } from '../../../helpers/createResponse';
import { commonErrorHandler } from '../../../helpers/commonErrorHandler';
import dbService from '../../database';
import validationServices from '../../validations';

export const signUp = async (
	{ email, password, confirmPassword, appId }: { email: string; password: string; confirmPassword: string; appId: string | null },
	c: Context
) => {
	try {
		responseService.signUpSchema.parse({ email, password, confirmPassword, appId });

		if (appId) {
			// validate app id
			const appValidationError = await validationServices.validateAppId(appId, c);
			if (appValidationError) {
				return appValidationError;
			}
		}

		// check for existing email
		const existingEmailResult = await dbService.query<{ results: { id: string }[] }>(c, 'SELECT id FROM users WHERE email = ?', [email]);
		if (existingEmailResult.success && existingEmailResult.data?.results?.length) {
			return createResponse(false, errorMessages.EMAIL_ALREADY_IN_USE, codes.EMAIL_ALREADY_IN_USE, null, httpStatus.CONFLICT);
		}

		const hashedPassword = await passwordService.hashPassword(password);
		const queryResult = await dbService.query<{ results: { id: string; email: string; username: string }[] }>(
			c,
			'INSERT INTO users (id, email, username, password, status, app_id) VALUES (?, ?, ?, ?, ?, ?) RETURNING id, email, username',
			[crypto.randomUUID(), email, email, hashedPassword, userStatuses.PENDING, appId || null]
		);

		if (!queryResult.success) {
			return createResponse(
				false,
				errorMessages.USER_CREATION_FAILED,
				codes.USER_CREATION_FAILED,
				queryResult.error,
				httpStatus.INTERNAL_SERVER_ERROR
			);
		}

		const user = queryResult.data?.results?.[0];
		if (!user) {
			return createResponse(false, errorMessages.USER_CREATION_FAILED, codes.USER_CREATION_FAILED, null, httpStatus.INTERNAL_SERVER_ERROR);
		}

		// add the password to the password history
		const passwordHistoryResult = await passwordService.addToPasswordHistory({ userId: user.id, passwordHash: hashedPassword }, c);
		if (passwordHistoryResult instanceof Error) {
			return createResponse(
				false,
				errorMessages.PASSWORD_HISTORY_ERROR,
				codes.PASSWORD_HISTORY_ERROR,
				null,
				httpStatus.INTERNAL_SERVER_ERROR
			);
		}

		// this is the point at which we send the initial verification email
		const emailResult = await emailService.sendVerificationEmail({ to: email, user, appId }, c);
		if (emailResult instanceof Error) {
			return createResponse(false, errorMessages.EMAIL_SEND_ERROR, codes.EMAIL_SEND_ERROR, null, httpStatus.INTERNAL_SERVER_ERROR);
		}

		// create a "payload" object
		// were gonna encrypt this and then
		// decrypt it at validation time
		const payload = {
			id: user.id,
			exp: Math.floor(Date.now() / 1000) + tokenConstants.EXPIRES_IN,
		};

		// encrypt the payload with an auth key
		// we need the auth key to decrypt at validation time
		const token = await jwtService.assignRefreshToken(c, payload);
		if (token instanceof Error) {
			return createResponse(false, token.message, codes.TOKEN_GENERATION_ERROR, null, httpStatus.INTERNAL_SERVER_ERROR);
		}

		return createResponse(
			true,
			errorMessages.SUCCESS,
			codes.SUCCESS,
			{
				access_token: token,
				token_type: tokenConstants.TYPE,
				expires_in: tokenConstants.EXPIRES_IN,
				// when testing, we don't need to actually send an email thats obnoxious
				// instead just return the same verification token as the email service would
				...(env(c).ENV === testEnv && { verificationToken: emailResult.verificationToken }),
			},
			httpStatus.OK
		);
	} catch (error) {
		return commonErrorHandler(error, c);
	}
};
