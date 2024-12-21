import { sign, verify } from 'hono/jwt';
import { env } from 'hono/adapter';
import { Context } from 'hono';

const jwtFactory = {
	assignRefreshToken: async (c: Context, payload: { id: string; exp: number }): Promise<string | Error> => {
		try {
			const authKey = env(c).AUTH_KEY;
			if (!authKey) {
				throw new Error('AUTH_KEY environment variable not found');
			}

			const token = await sign(payload, authKey);
			const expiresAt = new Date(payload.exp * 1000).toISOString();

			const db = env(c).DB;
			if (!db) {
				throw new Error('Database connection not found in context');
			}

			const d1Result: D1Result = await db
				.prepare('INSERT INTO refresh_tokens (token, user_id, expires_at) VALUES (?, ?, ?)')
				.bind(token, payload.id, expiresAt)
				.run();

			if (!d1Result.success) {
				throw new Error(d1Result.error + 'DEV');
			}

			return token;
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Unknown error';
			const errorStack = error instanceof Error ? error.stack : '';
			throw new Error(`Failed to assign refresh token: ${errorMessage} ${errorStack} DEV`);
		}
	},
	verifyRefreshToken: async (token: string, c: Context) => {
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

		const d1Result: D1Result = await db.prepare('SELECT * FROM refresh_tokens WHERE token = ?').bind(token).run();

		if (!d1Result.success) {
			return false;
		}

		const tokenData = d1Result.results?.[0] as { expires_at: string; revoked_at: string | null };
		if (!tokenData) {
			return false;
		}

		// check if the token is expired or revoked
		const { expires_at, revoked_at } = tokenData;
		if (new Date(expires_at) < new Date() || revoked_at !== null) {
			return false;
		}

		return true;
	},
};

export default jwtFactory;
