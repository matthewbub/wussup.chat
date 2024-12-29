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
import { OpenAPIHono } from '@hono/zod-openapi';
import { commonErrorResponse } from './helpers/commonErrorHandler';
import { loginRoute as loginRouteDefinition } from './routes/login.route';
import { signupRoute as signupRouteDefinition } from './routes/signup.route';
import adminAuthMiddleware from './middleware/admin.middleware';
import { refreshTokenRoute as refreshTokenRouteDefinition } from './routes/refreshToken.route';
import { verifyEmailRoute as verifyEmailRouteDefinition } from './routes/verifyEmail.route';

export interface Env {
	AUTH_KEY: string;
	DB: D1Database;
	ENV: string;
}

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

// routes
app.openapi(
	signupRouteDefinition,
	async (c) => {
		const { email, password, confirmPassword } = c.req.valid('json');
		const response = await publicService.signUp({ email, password, confirmPassword }, c);

		if (!response.success) {
			return c.json(response, response.status as 400 | 409);
		}
		return c.json(response, 200);
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

app.openapi(
	loginRouteDefinition,
	async (c) => {
		const { email, password } = c.req.valid('json');
		const response = await publicService.login({ email, password }, c);
		return c.json(
			{
				success: response.success,
				message: response.message,
				code: response.code,
				data: response.data,
			},
			response.success ? 200 : 401
		);
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

app.openapi(
	refreshTokenRouteDefinition,
	async (c) => {
		const { refreshToken } = c.req.valid('json');
		const response = await publicService.refreshToken({ refreshToken }, c);
		return c.json(
			{
				success: response.success,
				message: response.message,
				code: response.code,
				data: response.data,
			},
			response.success ? 200 : 401
		);
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

app.openapi(
	verifyEmailRouteDefinition,
	async (c) => {
		const { token } = c.req.valid('json');
		const response = await publicService.verifyEmail({ token }, c);
		return c.json(
			{
				success: response.success,
				message: response.message,
				code: response.code,
				data: response.data,
			},
			response.success ? 200 : 401
		);
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
