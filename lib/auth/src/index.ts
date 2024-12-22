import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { bearerAuth } from 'hono/bearer-auth';
import publicService from './public.service';
import { D1Database } from '@cloudflare/workers-types';
import jwtService from './jwt.service';

const authSchema = z.object({
	email: z.string().email().max(255),
	password: z.string().min(8).max(255),
	confirmPassword: z.string().min(8).max(255),
});

export interface Env {
	AUTH_KEY: string;
	DB: D1Database;
}

const app = new Hono<{ Bindings: Env }>();

// middleware
app.use(logger());
app.use(
	'/v3/*',
	bearerAuth({
		verifyToken: async (token, c) => {
			try {
				const isTokenValid = await jwtService.verifyRefreshToken(token, c);
				if (!isTokenValid) {
					return false;
				}
				return true;
			} catch {
				return false;
			}
		},
	})
);

// routes
app.post('/sign-up', zValidator('json', authSchema), async (c) => {
	const { email, password, confirmPassword } = await c.req.json();
	const result = await publicService.signUp({ email, password, confirmPassword }, c);
	return result;
});

app.get('/v3/test', (c) => {
	return c.json({ message: 'Hello World' });
});

app.get('/ping', async (c) => {
	return c.json({ message: 'pong' });
});

export default app;
