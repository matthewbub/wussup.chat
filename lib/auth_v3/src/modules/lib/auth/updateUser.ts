import { Context } from 'hono';
import jwtService from '../../jwt';
import emailService from '../../email';
import { createResponse } from '../../../helpers/createResponse';
import { commonErrorHandler } from '../../../helpers/commonErrorHandler';
import { codes, errorMessages, httpStatus, tokenTypes, timing } from '../../../constants';
import dbService from '../../database';

interface UpdateUserResponse {
	success: boolean;
	message: string;
	user?: {
		email: string;
		username: string;
		email_verified: boolean;
	};
}

/**
 * updates user information and handles email verification if email is changed
 */
export const updateUser = async (token: string, updates: { email?: string; username?: string }, c: Context) => {
	try {
		const payload = await jwtService.decodeToken(token, c);
		if (!payload?.id) {
			return createResponse(false, errorMessages.INVALID_TOKEN, codes.ERR_INVALID_TOKEN, null, httpStatus.UNAUTHORIZED);
		}

		const transaction = [];
		const updates_array = [];

		if (updates.username) {
			const existingUsername = await dbService.query<{ results: { id: string }[] }>(
				c,
				'SELECT id FROM users WHERE username = ? AND id != ?',
				[updates.username, payload.id]
			);

			if (existingUsername.data?.results?.length) {
				return createResponse(false, errorMessages.USERNAME_TAKEN, codes.ERR_USERNAME_TAKEN, null, httpStatus.BAD_REQUEST);
			}

			updates_array.push('username = ?');
		}

		if (updates.email) {
			const existingEmail = await dbService.query<{ results: { id: string }[] }>(c, 'SELECT id FROM users WHERE email = ? AND id != ?', [
				updates.email,
				payload.id,
			]);

			if (existingEmail.data?.results?.length) {
				return createResponse(false, errorMessages.EMAIL_REGISTERED, codes.ERR_EMAIL_REGISTERED, null, httpStatus.BAD_REQUEST);
			}

			updates_array.push('email = ?');

			const verificationToken = crypto.randomUUID();
			transaction.push({
				sql: 'INSERT INTO verification_tokens (token, user_id, type, expires_at) VALUES (?, ?, ?, ?)',
				params: [verificationToken, payload.id, tokenTypes.EMAIL, new Date(Date.now() + timing.EMAIL_VERIFICATION_EXPIRY).toISOString()],
			});
		}

		const updateQuery = `
			UPDATE users 
			SET ${updates_array.join(', ')}
			WHERE id = ?
			RETURNING email, username
		`;

		const bindParams = [];
		if (updates.username) bindParams.push(updates.username);
		if (updates.email) bindParams.push(updates.email);
		bindParams.push(payload.id);

		transaction.push({
			sql: updateQuery,
			params: bindParams,
		});

		const transactionResult = await dbService.transaction<{ results: UpdateUserResponse['user'][] }[]>(c, transaction);

		if (!transactionResult.success) {
			return createResponse(false, errorMessages.UPDATE_FAILED, codes.ERR_UPDATE_FAILED, null, httpStatus.INTERNAL_SERVER_ERROR);
		}

		const updatedUser = transactionResult.data?.[transactionResult.data.length - 1].results?.[0];

		if (updates.email) {
			await emailService.sendVerificationEmail(
				{
					to: updates.email,
					user: { id: payload.id },
				},
				c
			);
		}

		return createResponse(
			true,
			updates.email ? errorMessages.PROFILE_UPDATED_VERIFY : errorMessages.PROFILE_UPDATED,
			codes.SUCCESS,
			{ user: updatedUser },
			httpStatus.CREATED
		);
	} catch (error) {
		return commonErrorHandler(error, c);
	}
};

export default updateUser;
