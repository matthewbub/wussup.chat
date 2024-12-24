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

// OK    POST    /v3/public/sign-up             // new user registration returns JWT
// OK    POST    /v3/public/login               // user login, returns JWT
// OK    POST    /v3/public/refresh-token       // refresh access token using refresh token
// OK    POST    /v3/public/forgot-password     // initiate password reset
// OK    POST    /v3/public/reset-password      // complete password reset with token
// OK    GET     /v3/public/verify-email/:token // verify email with token
// OK    POST    /v3/public/resend-verification // resend verification email

// routes
app.post('/v3/public/sign-up', zValidator('json', responseService.signUpSchema), async (c) => {
	const { email, password, confirmPassword } = await c.req.json();
	const result = await publicService.signUp({ email, password, confirmPassword }, c);
	return result;
});

app.post('/v3/public/login', zValidator('json', responseService.loginSchema), async (c) => {
	const { email, password } = await c.req.json();
	const result = await publicService.login({ email, password }, c);
	return result;
});

app.post('/v3/public/refresh-token', zValidator('json', responseService.refreshSchema), async (c) => {
	const { refreshToken } = await c.req.json();
	const result = await publicService.refreshToken({ refreshToken }, c);
	return result;
});

app.post('/v3/public/verify-email', zValidator('json', responseService.verifyEmailSchema), async (c) => {
	const { token, email } = await c.req.json();
	const result = await publicService.verifyEmail({ token, email }, c);
	return result;
});

app.post('/v3/public/forgot-password', zValidator('json', responseService.forgotPasswordSchema), async (c) => {
	const { email } = await c.req.json();
	const result = await publicService.forgotPassword({ email }, c);
	return result;
});

app.post('/v3/public/reset-password', zValidator('json', responseService.resetPasswordSchema), async (c) => {
	const { token, password } = await c.req.json();
	const result = await publicService.resetPassword({ token, password }, c);
	return result;
});

app.post('/v3/public/resend-verification-email', zValidator('json', responseService.resendVerificationEmailSchema), async (c) => {
	const { email } = await c.req.json();
	const result = await publicService.resendVerificationEmail({ email }, c);
	return result;
});

app.get('/v3/test', (c) => {
	return c.json({ message: 'Hello World' });
});

export default app;
