import { Context } from 'hono';
import { env } from 'hono/adapter';

interface LoginAttemptResult {
	success: boolean;
	error?: string;
	remainingAttempts?: number;
}

const passwordService = {
	hashPassword: async (password: string, providedSalt?: Uint8Array): Promise<string> => {
		try {
			const encoder = new TextEncoder();
			// use provided salt if available, otherwise generate a new one
			const salt = providedSalt || crypto.getRandomValues(new Uint8Array(16));

			// import the password as a key material
			const keyMaterial = await crypto.subtle.importKey('raw', encoder.encode(password), { name: 'PBKDF2' }, false, [
				'deriveBits',
				'deriveKey',
			]);

			// derive a key using PBKDF2 with the specified salt and iterations
			const key = await crypto.subtle.deriveKey(
				{
					name: 'PBKDF2',
					salt: salt,
					iterations: 100000,
					hash: 'SHA-256',
				},
				keyMaterial,
				{ name: 'AES-GCM', length: 256 },
				true,
				['encrypt', 'decrypt']
			);

			// export the derived key to a raw format
			const exportedKey = (await crypto.subtle.exportKey('raw', key)) as ArrayBuffer;
			const hashBuffer = new Uint8Array(exportedKey);

			// convert the hash buffer to a hex string
			const hashArray = Array.from(hashBuffer);
			const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

			// convert the salt to a hex string
			const saltHex = Array.from(salt)
				.map((b) => b.toString(16).padStart(2, '0'))
				.join('');

			// return the salt and hash as a combined string
			return `${saltHex}:${hashHex}`;
		} catch (error) {
			// handle any errors that occur during the hashing process
			throw new Error(`Failed to hash password: ${error instanceof Error ? error.message : 'Unknown error'}`);
		}
	},
	verifyPassword: async (storedHash: string, passwordAttempt: string): Promise<boolean> => {
		try {
			// extract the salt and original hash from the stored hash
			const [saltHex, originalHash] = storedHash.split(':');

			// match the salt hex string to pairs of characters
			const matchResult = saltHex.match(/.{1,2}/g);
			if (!matchResult) {
				throw new Error('Invalid salt format');
			}

			// convert the matched result to a Uint8Array
			const salt = new Uint8Array(matchResult.map((byte) => parseInt(byte, 16)));

			// hash the password attempt using the extracted salt
			const attemptHashWithSalt = await passwordService.hashPassword(passwordAttempt, salt);

			// extract the hash from the result
			const [, attemptHash] = attemptHashWithSalt.split(':');

			// return true if the attempt hash matches the original hash
			return attemptHash === originalHash;
		} catch (error) {
			throw new Error(`Failed to verify password: ${error instanceof Error ? error.message : 'Unknown error'}`);
		}
	},
	addToPasswordHistory: async ({ userId, passwordHash }: { userId: string; passwordHash: string }, c: Context) => {
		const db = env(c).DB;
		if (!db) {
			throw new Error('Database connection not found in context');
		}

		try {
			const id = crypto.randomUUID();
			const result = await db
				.prepare('INSERT INTO password_history (id, user_id, password_hash) VALUES (?, ?, ?)')
				.bind(id, userId, passwordHash)
				.run();
			return result;
		} catch (error) {
			// Check if error is due to unique constraint violation
			if (error instanceof Error && error.message.includes('unique_user_password')) {
				// Password already exists in history - this might be a reuse attempt
				return null;
			}
			throw error;
		}
	},
	handleLoginAttempt: async (
		{
			user,
			passwordAttempt,
		}: {
			user: {
				id: string;
				password: string;
				failed_login_attempts: number;
				status: string;
			};
			passwordAttempt: string;
		},
		c: Context
	): Promise<LoginAttemptResult> => {
		const db = env(c).DB;
		if (!db) {
			throw new Error('Database connection not found in context');
		}

		const MAX_FAILED_ATTEMPTS = 3;

		// Verify password
		const isPasswordValid = await passwordService.verifyPassword(user.password, passwordAttempt);
		if (!isPasswordValid) {
			const newAttempts = user.failed_login_attempts + 1;

			// if new attempts is greater than or equal to max failed attempts
			if (newAttempts >= MAX_FAILED_ATTEMPTS) {
				const oneHourFromNow = new Date(Date.now() + 60 * 60 * 1000).toISOString();

				await db
					.prepare(
						`
						UPDATE users 
						SET failed_login_attempts = ?, 
								locked_until = ?,
								status = 'temporarily_locked',
								status_before_lockout = ?
						WHERE id = ?
					`
					)
					.bind(newAttempts, oneHourFromNow, user.status, user.id)
					.run();

				return {
					success: false,
					error: 'Account locked due to too many failed attempts. Please check your email to reset your password.',
				};
			}

			// Increment failed attempts
			await db.prepare('UPDATE users SET failed_login_attempts = ? WHERE id = ?').bind(newAttempts, user.id).run();

			return {
				success: false,
				error: 'Invalid password',
				remainingAttempts: MAX_FAILED_ATTEMPTS - newAttempts,
			};
		}

		// Reset failed attempts and status on successful login
		// attempt to restore the status before lockout if it exists
		// if the check fails, set the status to pending
		// worst case user will need to reverify their email
		await db
			.prepare(
				`
				UPDATE users 
				SET failed_login_attempts = 0, 
					locked_until = NULL, 
					last_login_at = CURRENT_TIMESTAMP,
					status = CASE 
						WHEN status = 'temporarily_locked' AND status_before_lockout IS NOT NULL 
							THEN status_before_lockout
						WHEN status = 'temporarily_locked' 
							THEN 'pending'
						ELSE status 
					END,
					status_before_lockout = NULL
				WHERE id = ?
			`
			)
			.bind(user.id)
			.run();

		return { success: true };
	},
};

export default passwordService;
