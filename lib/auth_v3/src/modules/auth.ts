import { Context } from 'hono';
import { env } from 'hono/adapter';
import jwtService from './jwt';
import passwordService from './password';
import emailService from './email';

interface LogoutResponse {
	success: boolean;
	message: string;
}

interface ChangePasswordResponse {
	success: boolean;
	message: string;
}

interface UserResponse {
	success: boolean;
	message?: string;
	user?: {
		id: string;
		email: string;
		username: string;
		status: string;
		role: string;
		email_verified: boolean;
		last_login_at: string | null;
		created_at: string;
	};
}

interface UpdateUserResponse {
	success: boolean;
	message: string;
	user?: {
		email: string;
		username: string;
		email_verified: boolean;
	};
}

interface DeleteAccountResponse {
	success: boolean;
	message: string;
}

const authService = {
	logout: async (token: string, c: Context) => {
		const db = env(c).DB;
		try {
			// Revoke the current token
			const revoked = await jwtService.revokeRefreshToken(token, c);
			if (!revoked) {
				return c.json<LogoutResponse>(
					{
						success: false,
						message: 'Failed to logout',
					},
					500
				);
			}

			return c.json<LogoutResponse>({
				success: true,
				message: 'Successfully logged out',
			});
		} catch (error) {
			return c.json<LogoutResponse>(
				{
					success: false,
					message: error instanceof Error ? error.message : 'Unknown error',
				},
				500
			);
		}
	},

	changePassword: async (
		{ currentPassword, newPassword }: { currentPassword: string; newPassword: string },
		c: Context
	): Promise<ChangePasswordResponse> => {
		const db = env(c).DB;
		const token = c.req.header('Authorization')?.split(' ')[1];

		if (!token) {
			return {
				success: false,
				message: 'Authentication required',
			};
		}

		try {
			// Get user from the token
			const payload = await jwtService.decodeToken(token, c);
			if (!payload?.id) {
				return {
					success: false,
					message: 'Invalid token',
				};
			}

			// Get user's current password hash
			const userResult = await db.prepare('SELECT id, password, status FROM users WHERE id = ?').bind(payload.id).run();

			const user = userResult.results?.[0] as { id: string; password: string; status: string };
			if (!user) {
				return {
					success: false,
					message: 'User not found',
				};
			}

			// Verify current password
			const isCurrentPasswordValid = await passwordService.verifyPassword(user.password, currentPassword);
			if (!isCurrentPasswordValid) {
				return {
					success: false,
					message: 'Current password is incorrect',
				};
			}

			// Hash new password
			const hashedNewPassword = await passwordService.hashPassword(newPassword);

			// Check if new password was recently used
			const isPasswordReused = await passwordService.isPasswordReused({ userId: user.id, newPasswordHash: hashedNewPassword }, c);

			if (isPasswordReused) {
				return {
					success: false,
					message: 'Cannot reuse a recent password',
				};
			}

			// Update password and add to history in a transaction
			const transaction = db.batch([
				db.prepare('UPDATE users SET password = ? WHERE id = ?').bind(hashedNewPassword, user.id),
				db
					.prepare('INSERT INTO password_history (id, user_id, password_hash) VALUES (?, ?, ?)')
					.bind(crypto.randomUUID(), user.id, hashedNewPassword),
			]);

			const results = await transaction;
			if (!results.every((result: { success: boolean }) => result.success)) {
				throw new Error('Failed to update password');
			}

			// Revoke all refresh tokens for this user for security
			await db
				.prepare('UPDATE refresh_tokens SET revoked_at = CURRENT_TIMESTAMP WHERE user_id = ? AND revoked_at IS NULL')
				.bind(user.id)
				.run();

			return {
				success: true,
				message: 'Password changed successfully. Please log in with your new password.',
			};
		} catch (error) {
			return {
				success: false,
				message: error instanceof Error ? error.message : 'Failed to change password',
			};
		}
	},

	getCurrentUser: async (token: string, c: Context): Promise<UserResponse> => {
		const db = env(c).DB;

		try {
			const payload = await jwtService.decodeToken(token, c);
			if (!payload?.id) {
				return {
					success: false,
					message: 'Invalid token',
				};
			}

			const userResult = await db
				.prepare(
					`
					SELECT id, email, username, status, role, 
						   email_verified, last_login_at, created_at 
					FROM users 
					WHERE id = ?
				`
				)
				.bind(payload.id)
				.run();

			const user = userResult.results?.[0];
			if (!user) {
				return {
					success: false,
					message: 'User not found',
				};
			}

			return {
				success: true,
				user: user as UserResponse['user'],
			};
		} catch (error) {
			return {
				success: false,
				message: error instanceof Error ? error.message : 'Failed to fetch user data',
			};
		}
	},

	updateUser: async (token: string, updates: { email?: string; username?: string }, c: Context): Promise<UpdateUserResponse> => {
		const db = env(c).DB;

		try {
			// Decode the token to extract user information
			const payload = await jwtService.decodeToken(token, c);
			if (!payload?.id) {
				// If the token is invalid or doesn't contain an ID, return an error
				return { success: false, message: 'Invalid token' };
			}

			// Initialize some arrays to hold SQL transaction steps and update fields
			const transaction = [];
			const updates_array = [];

			// Check if a username update is requested
			if (updates.username) {
				// Verify if the new username is already taken by another user
				const existingUsername = await db
					.prepare('SELECT id FROM users WHERE username = ? AND id != ?')
					.bind(updates.username, payload.id)
					.run();

				if (existingUsername.results?.length) {
					// If the username is taken, return an error
					return { success: false, message: 'Username already taken' };
				}

				// Add the username update to the list of updates
				updates_array.push('username = ?');
			}

			// Check if an email update is requested
			if (updates.email) {
				// Verify if the new email is already registered to another user
				const existingEmail = await db.prepare('SELECT id FROM users WHERE email = ? AND id != ?').bind(updates.email, payload.id).run();

				if (existingEmail.results?.length) {
					// If the email is already registered, return an error
					return { success: false, message: 'Email already registered' };
				}

				// Add the email update and reset email verification status
				updates_array.push('email = ?');
				// updates_array.push('email_verified = false');

				// Generate a verification token for the new email
				const verificationToken = crypto.randomUUID();
				transaction.push(
					db.prepare('INSERT INTO verification_tokens (token, user_id, type, expires_at) VALUES (?, ?, ?, ?)').bind(
						verificationToken,
						payload.id,
						'email',
						new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // Token expires in 24 hours
					)
				);
			}

			// Construct the SQL update query using the collected updates
			const updateQuery = `
            UPDATE users 
            SET ${updates_array.join(', ')}
            WHERE id = ?
            RETURNING email, username
        `;

			// Prepare the parameters for the update query
			const bindParams = [];
			if (updates.username) bindParams.push(updates.username);
			if (updates.email) {
				bindParams.push(updates.email);
			}
			bindParams.push(payload.id);

			// Add the update query to the transaction
			transaction.push(db.prepare(updateQuery).bind(...bindParams));

			// Execute the transaction to apply all changes
			const results = await db.batch(transaction);

			// Check if all transaction steps were successful
			if (!results.every((result: { success: boolean }) => result.success)) {
				throw new Error('Failed to update user information');
			}

			// Extract the updated user information from the transaction results
			const updatedUser = results[results.length - 1].results?.[0] as UpdateUserResponse['user'];

			// If the email was updated, send a verification email
			if (updates.email) {
				await emailService.sendVerificationEmail(
					{
						to: updates.email,
						user: { id: payload.id },
					},
					c
				);
			}

			// Return a success response with the updated user information
			return {
				success: true,
				message: updates.email ? 'Profile updated. Please verify your new email address.' : 'Profile updated successfully',
				user: updatedUser,
			};
		} catch (error) {
			// Handle any errors that occur during the update process
			return {
				success: false,
				message: error instanceof Error ? error.message : 'Failed to update profile',
			};
		}
	},

	deleteAccount: async (token: string, c: Context): Promise<DeleteAccountResponse> => {
		const db = env(c).DB;

		try {
			const payload = await jwtService.decodeToken(token, c);
			if (!payload?.id) {
				return { success: false, message: 'Invalid token' };
			}

			// Update user status to deleted and revoke all tokens
			const transaction = db.batch([
				db.prepare('UPDATE users SET status = ? WHERE id = ?').bind('deleted', payload.id),
				db.prepare('UPDATE refresh_tokens SET revoked_at = CURRENT_TIMESTAMP WHERE user_id = ? AND revoked_at IS NULL').bind(payload.id),
			]);

			const results = await transaction;
			if (!results.every((result: { success: boolean }) => result.success)) {
				throw new Error('Failed to delete account');
			}

			return {
				success: true,
				message: 'Account successfully deleted',
			};
		} catch (error) {
			return {
				success: false,
				message: error instanceof Error ? error.message : 'Failed to delete account',
			};
		}
	},

	// Helper method to check user status
	validateUserStatus: async (userId: string, c: Context): Promise<boolean> => {
		const db = env(c).DB;

		try {
			const userResult = await db.prepare('SELECT status FROM users WHERE id = ?').bind(userId).run();

			const user = userResult.results?.[0] as { status: string };
			if (!user) return false;

			return !['deleted', 'suspended'].includes(user.status);
		} catch {
			return false;
		}
	},
};

export default authService;
