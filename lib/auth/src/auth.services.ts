import { Context } from 'hono';
import { v4 as uuidv4 } from 'uuid';
import { env } from 'hono/adapter';
import jwtFactory from './jwt.services';
const EXPIRES_IN = 60 * 60; // 1 hour

interface AuthResponse {
	access_token: string;
	token_type: string;
	expires_in: number;
}

const authService = {
	signUp: async (c: Context, { email, password, confirmPassword }: { email: string; password: string; confirmPassword: string }) => {
		if (password !== confirmPassword) {
			return c.json({ error: 'Passwords do not match' }, 400);
		}

		const db = env(c).DB;
		try {
			const d1Result: D1Result = await db
				.prepare('INSERT INTO users (id, email, username, password) VALUES (?, ?, ?, ?) RETURNING id, email, username')
				// we are use the email as the username by default
				.bind(uuidv4(), email, email, password)
				.run();

			if (!d1Result.success) {
				return c.json({ error: d1Result.error }, 500);
			}

			const user = d1Result.results?.[0] as { id: string };
			if (!user) {
				throw new Error('Failed to create user');
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
			const token = await jwtFactory.assignRefreshToken(c, payload);
			if (token instanceof Error) {
				// throw new Error(token.message);
				return c.json({ error: token.message }, 500);
			}

			// standardized OAuth-style response
			return c.json<AuthResponse>({
				access_token: token,
				token_type: 'Bearer',
				expires_in: EXPIRES_IN,
			});
		} catch (error) {
			return c.json({ error: error instanceof Error ? error.message : 'Unknown error' }, 500);
		}
	},
};

export default authService;
