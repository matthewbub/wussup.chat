import { Context } from 'hono';
import { env } from 'hono/adapter';
import jwtService from '../../jwt';
import passwordService from '../../password';
import emailService from '../../email';
import { createResponse } from '../../../helpers/createResponse';
import { commonErrorHandler } from '../../../helpers/commonErrorHandler';
import logout from './logout';
import changePassword from './changePassword';
import getCurrentUser from './getCurrentUser';

interface UpdateUserResponse {
	success: boolean;
	message: string;
	user?: {
		email: string;
		username: string;
		email_verified: boolean;
	};
}

export const updateUser = async (token: string, updates: { email?: string; username?: string }, c: Context) => {
	const db = env(c).DB;

	try {
		// Decode the token to extract user information
		const payload = await jwtService.decodeToken(token, c);
		if (!payload?.id) {
			return createResponse(false, 'Invalid token', 'ERR_INVALID_TOKEN');
		}

		const transaction = [];
		const updates_array = [];

		// Check if a username update is requested
		if (updates.username) {
			const existingUsername = await db
				.prepare('SELECT id FROM users WHERE username = ? AND id != ?')
				.bind(updates.username, payload.id)
				.run();

			if (existingUsername.results?.length) {
				return createResponse(false, 'Username already taken', 'ERR_USERNAME_TAKEN');
			}

			updates_array.push('username = ?');
		}

		// Check if an email update is requested
		if (updates.email) {
			const existingEmail = await db.prepare('SELECT id FROM users WHERE email = ? AND id != ?').bind(updates.email, payload.id).run();

			if (existingEmail.results?.length) {
				return createResponse(false, 'Email already registered', 'ERR_EMAIL_REGISTERED');
			}

			updates_array.push('email = ?');

			const verificationToken = crypto.randomUUID();
			transaction.push(
				db
					.prepare('INSERT INTO verification_tokens (token, user_id, type, expires_at) VALUES (?, ?, ?, ?)')
					.bind(verificationToken, payload.id, 'email', new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString())
			);
		}

		const updateQuery = `
            UPDATE users 
            SET ${updates_array.join(', ')}
            WHERE id = ?
            RETURNING email, username
        `;

		const bindParams = [];
		if (updates.username) bindParams.push(updates.username);
		if (updates.email) {
			bindParams.push(updates.email);
		}
		bindParams.push(payload.id);

		transaction.push(db.prepare(updateQuery).bind(...bindParams));

		const results = await db.batch(transaction);

		if (!results.every((result: { success: boolean }) => result.success)) {
			return createResponse(false, 'Failed to update user information', 'ERR_UPDATE_FAILED');
		}

		const updatedUser = results[results.length - 1].results?.[0] as UpdateUserResponse['user'];

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
			updates.email ? 'Profile updated. Please verify your new email address.' : 'Profile updated successfully',
			'SUCCESS',
			{ user: updatedUser }
		);
	} catch (error) {
		return commonErrorHandler(error, c);
	}
};

export default updateUser;
