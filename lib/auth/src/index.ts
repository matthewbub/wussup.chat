import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { HTTPException } from 'hono/http-exception';
import { sign, verify } from 'hono/jwt';
import { getCookie, setCookie } from 'hono/cookie';
import { bearerAuth } from 'hono/bearer-auth';
import { env } from 'hono/adapter';

const authSchema = z.object({
	email: z.string().email(),
	password: z.string().min(8),
});

export interface Env {
	AUTH_KEY: string;
}

const app = new Hono<{ Bindings: Env }>();

// middleware
app.use(logger());

interface AuthResponse {
	access_token: string;
	token_type: string;
	expires_in: number;
}

// routes
app.post('/sign-up', zValidator('json', authSchema), async (c) => {
	const { email, password } = await c.req.json();

	const expiresIn = 60 * 60; // 1 hour

	// create a "payload" object
	// were gonna encrypt this and then
	// decrypt it at validation time
	const payload = {
		email,
		exp: Math.floor(Date.now() / 1000) + expiresIn,
	};

	// encrypt the payload with an auth key
	// we need the auth key to decrypt at validation time
	const token = await sign(payload, env(c).AUTH_KEY);

	// standardized OAuth-style response
	return c.json<AuthResponse>({
		access_token: token,
		token_type: 'Bearer',
		expires_in: expiresIn,
	});
});

// Add a verification endpoint
app.post('/verify', async (c) => {
	// get the token from the Authorization header
	const token = c.req.header('Authorization')?.split(' ')[1];

	if (!token) {
		throw new HTTPException(401, { message: 'No token provided' });
	}

	try {
		const payload = await verify(token, env(c).AUTH_KEY);
		return c.json({ valid: true, payload });
	} catch {
		throw new HTTPException(401, { message: 'Invalid token' });
	}
});

export default app;
