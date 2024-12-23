import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { bearerAuth } from 'hono/bearer-auth';
import publicService from './public.service';
import { D1Database } from '@cloudflare/workers-types';
import jwtService from './jwt.service';
import responseService from './response.service';
import emailService from './email.service';

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
app.post('/sign-up', zValidator('json', responseService.signUpSchema), async (c) => {
	const { email, password, confirmPassword } = await c.req.json();
	const result = await publicService.signUp({ email, password, confirmPassword }, c);
	return result;
});

app.post('/login', zValidator('json', responseService.loginSchema), async (c) => {
	const { email, password } = await c.req.json();
	const result = await publicService.login({ email, password }, c);
	return result;
});

app.post('/refresh-token', zValidator('json', responseService.refreshSchema), async (c) => {
	const { refreshToken } = await c.req.json();
	const result = await publicService.refreshToken({ refreshToken }, c);
	return result;
});

app.get('/v3/test', (c) => {
	return c.json({ message: 'Hello World' });
});

app.post('/verify-email', zValidator('json', z.object({ token: z.string(), email: z.string() })), async (c) => {
	const { token, email } = await c.req.json();
	const result = await publicService.verifyEmail({ token, email }, c);
	return result;
});

app.get('/ping', async (c) => {
	return c.json({ message: 'pong' });
});

export default app;
