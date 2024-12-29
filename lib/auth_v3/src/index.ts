import { Context, Hono } from 'hono';
import { logger } from 'hono/logger';
import { bearerAuth } from 'hono/bearer-auth';
import { env } from 'hono/adapter';
import { zValidator } from '@hono/zod-validator';
import { D1Database } from '@cloudflare/workers-types';
import publicService from './modules/lib/public';
import authService from './modules/lib/auth';
import jwtService from './modules/jwt';
import responseService from './modules/response';
import adminService from './modules/lib/admin';
import { createResponse } from './helpers/createResponse';
import { createRoute, OpenAPIHono } from '@hono/zod-openapi';
import { commonErrorHandler, commonErrorResponse } from './helpers/commonErrorHandler';

export interface Env {
	AUTH_KEY: string;
	DB: D1Database;
	ENV: string;
}

// const app = new Hono<{ Bindings: Env }>();
const app = new OpenAPIHono<{ Bindings: Env }>({
	defaultHook: (result, c) => {
		if (!result.success) {
			return c.json(
				createResponse(
					false,
					'Validation error',
					'VALIDATION_ERROR',
					{
						errors: result.error.errors,
					},
					400
				)
			);
		}
	},
});

app.onError(commonErrorResponse);

// middleware
app.use(logger());
app.use(
	'/v3/auth/*',
	bearerAuth({
		verifyToken: async (token, c) => {
			try {
				return await jwtService.verifyRefreshToken(token, c);
			} catch {
				return false;
			}
		},
	})
);

// Add this middleware function
const adminAuthMiddleware = async (c: Context, next: () => Promise<void>) => {
	const token = c.req.header('Authorization')?.split(' ')[1];
	if (!token) {
		return c.json({ success: false, message: 'No token provided' }, 401);
	}

	const payload = await jwtService.decodeToken(token, c);
	if (!payload?.id) {
		return c.json({ success: false, message: 'Invalid token' }, 401);
	}

	const db = env(c).DB;
	const userResult = await db.prepare('SELECT role FROM users WHERE id = ?').bind(payload.id).run();

	const user = userResult.results?.[0] as { role: string };
	if (!user || user.role !== 'admin') {
		return c.json({ success: false, message: 'Unauthorized' }, 403);
	}

	await next();
};

// routes
app.post('/v3/public/sign-up', async (c) => {
	const { email, password, confirmPassword } = await c.req.json();
	const response = await publicService.signUp(
		{
			email,
			password,
			confirmPassword,
		},
		c
	);
	return c.json(response, response.status);
});

// app.post('/v3/public/login', async (c) => {
// 	const { email, password } = await c.req.json();
// 	const response = await publicService.login({ email, password }, c);
// 	return c.json(response, response.status);
// });

const loginRoute = createRoute({
	method: 'post',
	path: '/v3/public/login',
	request: {
		body: {
			content: {
				'application/json': {
					schema: responseService.loginSchemas.request,
				},
			},
			required: true,
		},
	},
	responses: {
		200: {
			content: {
				'application/json': {
					schema: responseService.loginSchemas.response,
				},
			},
			description: 'Login successful',
		},
		401: {
			content: {
				'application/json': {
					schema: responseService.loginSchemas.error,
				},
			},
			description: 'Invalid credentials',
		},
		403: {
			content: {
				'application/json': {
					schema: responseService.loginSchemas.error,
				},
			},
			description: 'Account suspended or deleted',
		},
		404: {
			content: {
				'application/json': {
					schema: responseService.loginSchemas.error,
				},
			},
			description: 'User not found',
		},
		400: {
			content: {
				'application/json': {
					schema: responseService.loginSchemas.error,
				},
			},
			description: 'Validation error',
		},
	},
});

app.openapi(
	loginRoute,
	async (c) => {
		const { email, password } = c.req.valid('json');
		const response = await publicService.login({ email, password }, c);
		return c.json(response, response.status || 400);
	},
	(result, c) => {
		if (!result.success) {
			return c.json(
				createResponse(
					false,
					'Validation error',
					'VALIDATION_ERROR',
					{
						errors: result.error.errors,
					},
					400
				),
				400
			);
		}
	}
);

app.post('/v3/public/refresh-token', async (c) => {
	const { refreshToken } = await c.req.json();
	const response = await publicService.refreshToken({ refreshToken }, c);
	return c.json(response, response.status);
});

app.post('/v3/public/verify-email', async (c) => {
	const { token } = await c.req.json();
	const response = await publicService.verifyEmail({ token }, c);
	return c.json(response, response.status);
});

app.post('/v3/public/forgot-password', async (c) => {
	const { email } = await c.req.json();
	const response = await publicService.forgotPassword({ email }, c);
	return c.json(response, response.status);
});

app.post('/v3/public/reset-password', async (c) => {
	const { token, password, confirmPassword } = await c.req.json();
	const response = await publicService.resetPassword(
		{
			token,
			password,
			confirmPassword,
		},
		c
	);
	return c.json(response, response.status);
});

app.post('/v3/public/resend-verification-email', async (c) => {
	const { email } = await c.req.json();
	const response = await publicService.resendVerificationEmail({ email }, c);
	return c.json(response, response.status);
});

app.get('/v3/auth/logout', async (c) => {
	const token = c.req.header('Authorization')?.split(' ')[1];
	if (!token) {
		return c.json(createResponse(false, 'No token provided', 'ERR_NO_TOKEN_PROVIDED', null, 401));
	}
	const response = await authService.logout(token, c);
	return c.json(response, response.status);
});

app.get('/v3/auth/me', async (c) => {
	const token = c.req.header('Authorization')?.split(' ')[1];
	if (!token) {
		return c.json(createResponse(false, 'No token provided', 'ERR_NO_TOKEN_PROVIDED'), 401);
	}
	const result = await authService.getCurrentUser(token, c);
	return c.json(result, result.status);
});

app.put('/v3/auth/me', zValidator('json', responseService.updateUserSchema), async (c) => {
	const token = c.req.header('Authorization')?.split(' ')[1];
	if (!token) {
		return c.json(createResponse(false, 'No token provided', 'ERR_NO_TOKEN_PROVIDED'), 401);
	}
	const updates = await c.req.json();
	const result = await authService.updateUser(token, updates, c);
	return c.json(result, result.status);
});

app.delete('/v3/auth/me', async (c) => {
	const token = c.req.header('Authorization')?.split(' ')[1];
	if (!token) {
		return c.json(createResponse(false, 'No token provided', 'ERR_NO_TOKEN_PROVIDED'), 401);
	}
	const result = await authService.deleteAccount(token, c);
	return c.json(result, result.status);
});

// Admin routes
app.use('/v3/admin/*', adminAuthMiddleware);

app.post('/v3/admin/users/:id/promote', async (c) => {
	const token = c.req.header('Authorization')?.split(' ')[1];
	if (!token) {
		return c.json(createResponse(false, 'No token provided', 'ERR_NO_TOKEN_PROVIDED'), 401);
	}

	const userId = c.req.param('id');
	const result = await adminService.promoteUser(userId, c);
	return c.json(result, result.status);
});

app.post('/test/v3/test/admin/test/users/test/:id/test/promote/test', async (c) => {
	if (env(c).ENV !== 'test') {
		return c.json(createResponse(false, 'Not allowed', 'ERR_NOT_ALLOWED'), 403);
	}

	const token = c.req.header('Authorization')?.split(' ')[1];
	if (!token) {
		return c.json(createResponse(false, 'No token provided', 'ERR_NO_TOKEN_PROVIDED'), 401);
	}

	const userId = c.req.param('id');
	const result = await adminService.promoteUser(userId, c);
	return c.json(result, result.status);
});

app.get('/v3/admin/users', async (c) => {
	const token = c.req.header('Authorization')?.split(' ')[1];
	if (!token) {
		return c.json(createResponse(false, 'No token provided', 'ERR_NO_TOKEN_PROVIDED'), 401);
	}

	const result = await adminService.listUsers(c);
	return c.json(result, result.status);
});

app.post('/v3/admin/users/:id/suspend', async (c) => {
	const token = c.req.header('Authorization')?.split(' ')[1];
	if (!token) {
		return c.json(createResponse(false, 'No token provided', 'ERR_NO_TOKEN_PROVIDED'), 401);
	}

	const userId = c.req.param('id');
	const result = await adminService.suspendUser(userId, c);
	return c.json(result, result.status);
});

app.doc('/docs', {
	openapi: '3.0.0',
	info: {
		title: 'Auth API',
		version: '3.0.0',
		description: 'Authentication service API',
	},
});

export default app;
