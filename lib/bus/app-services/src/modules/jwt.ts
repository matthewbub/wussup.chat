import { Context } from 'hono';
import { decode, sign, verify } from 'hono/jwt';
import { env } from 'hono/adapter';
import dbService from './database';

const jwtService = {
	assignRefreshToken: async (c: Context, payload: { id: string; exp: number }): Promise<string | Error> => {
		try {
			const authKey = env(c).AUTH_KEY;
			if (!authKey) {
				throw new Error('AUTH_KEY environment variable not found');
			}

			let token;

			// Attempt to generate a unique token
			for (let attempts = 0; attempts < 5; attempts++) {
				token = await sign(payload, authKey);

				const existingTokenResult = await dbService.query<{ results: { token: string }[] }>(
					c,
					'SELECT token FROM refresh_tokens WHERE token = ?',
					[token]
				);

				if (!existingTokenResult.success || !existingTokenResult.data?.results?.length) {
					break; // Token is unique
				}
			}

			if (!token) {
				throw new Error('Failed to generate a unique token');
			}

			const expiresAt = new Date(payload.exp * 1000).toISOString();

			const res = await dbService.transaction(c, [
				{
					sql: 'INSERT INTO refresh_tokens (token, user_id, expires_at) VALUES (?, ?, ?)',
					params: [token, payload.id, expiresAt],
				},
			]);

			if (!res.success) {
				throw new Error(res.error + 'DEV');
			}

			return token;
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Unknown error';
			const errorStack = error instanceof Error ? error.stack : '';
			throw new Error(`Failed to assign refresh token: ${errorMessage} ${errorStack}`);
		}
	},
	// this is just a seriees of checks to see if the token and user are both valid
	verifyRefreshToken: async (token: string, c: Context): Promise<boolean> => {
		const authKey = env(c).AUTH_KEY;
		if (!authKey) {
			return false;
		}

		// verify token authenticity
		const isTokenValid = await verify(token, authKey);
		if (!isTokenValid) {
			return false;
		}

		const db = env(c).DB;
		if (!db) {
			return false;
		}

		const res = await dbService.query<{ results: { expires_at: string; revoked_at: string | null; user_id: string }[] }>(
			c,
			'SELECT * FROM refresh_tokens WHERE token = ?',
			[token]
		);

		if (!res.success) {
			return false;
		}

		const tokenData = res.data?.results?.[0] as { expires_at: string; revoked_at: string | null; user_id: string };
		if (!tokenData) {
			return false;
		}

		// check if the token is expired or revoked
		const { expires_at, revoked_at } = tokenData;
		if (new Date(expires_at) < new Date() || revoked_at !== null) {
			return false;
		}

		const user = await dbService.query<{ results: { id: string; status: string }[] }>(
			c,
			'SELECT * FROM users WHERE id = ? AND status = ?',
			[tokenData.user_id, 'active']
		);
		if (!user.success) {
			return false;
		}

		return true;
	},
	// this method exits for the refrsh token validation
	validateTokenAndUser: async (
		tokenData: { expires_at: string; revoked_at: string | null; user_id: string },
		c: Context
	): Promise<boolean> => {
		const db = env(c).DB;
		if (!db) {
			return false;
		}

		// check if the token is expired or revoked
		const { expires_at, revoked_at } = tokenData;
		if (new Date(expires_at) < new Date() || revoked_at !== null) {
			return false;
		}

		const user = await dbService.query<{ results: { id: string; status: string }[] }>(
			c,
			'SELECT * FROM users WHERE id = ? AND status = ?',
			[tokenData.user_id, 'active']
		);
		if (!user.success) {
			return false;
		}

		return true;
	},
	revokeRefreshToken: async (token: string, c: Context): Promise<boolean> => {
		const db = env(c).DB;
		if (!db) {
			return false;
		}

		try {
			const res = await dbService.transaction(c, [
				{
					sql: 'UPDATE refresh_tokens SET revoked_at = CURRENT_TIMESTAMP WHERE token = ? AND revoked_at IS NULL',
					params: [token],
				},
			]);
			return res.success;
		} catch (error) {
			return false;
		}
	},
	decodeToken: async (token: string, c: Context): Promise<{ id: string; exp: number } | null> => {
		try {
			const authKey = env(c).AUTH_KEY;
			if (!authKey) {
				return null;
			}
			const decoded = await decode(token);
			return decoded.payload as { id: string; exp: number };
		} catch (error) {
			return null;
		}
	},
};

export default jwtService;
