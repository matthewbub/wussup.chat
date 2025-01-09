import { logger } from 'hono/logger';
import { bearerAuth } from 'hono/bearer-auth';
import { cors } from 'hono/cors';
import { env } from 'hono/adapter';
import { D1Database } from '@cloudflare/workers-types';
import publicService from './modules/lib/public';
import authService from './modules/lib/auth';
import jwtService from './modules/jwt';
import adminService from './modules/lib/admin';
import { createResponse } from './helpers/createResponse';
import { OpenAPIHono } from '@hono/zod-openapi';
import adminAuthMiddleware from './middleware/admin.middleware';
import validationErrorHook from './hooks/validationError.hook';
import { commonErrorResponse } from './helpers/commonErrorHandler';
import { loginRouteDefinition } from './openapi/loginSchemas';
import { signupRouteDefinition } from './routeDefinitions/signup.def';
import { refreshTokenRouteDefinition } from './routeDefinitions/refreshToken.def';
import { verifyEmailRouteDefinition } from './routeDefinitions/verifyEmail.def';
import { forgotPasswordRouteDefinition } from './routeDefinitions/forgotPassword.def';
import { resetPasswordRouteDefinition } from './routeDefinitions/resetPassword.def';
import { resendVerificationEmailRouteDefinition } from './routeDefinitions/resendEmailVerification.def';
import { logoutRouteDefinition } from './routeDefinitions/logout.def';
import { getCurrentUserRouteDefinition } from './routeDefinitions/getCurrentUser.def';
import { updateUserRouteDefinition } from './routeDefinitions/updateUser.def';
import { deleteUserRouteDefinition } from './routeDefinitions/deleteUser.def';

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
	'*',
	cors({
		origin: 'http://localhost:3000',
		allowMethods: ['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE'],
		allowHeaders: ['Content-Type', 'Authorization', 'X-App-Id'],
		maxAge: 86400,
	})
);
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

// public routes
app.openapi(signupRouteDefinition, publicService.routes.signUpRoute, validationErrorHook);
app.openapi(loginRouteDefinition, publicService.routes.loginRoute, validationErrorHook);
app.openapi(refreshTokenRouteDefinition, publicService.routes.refreshTokenRoute, validationErrorHook);
app.openapi(verifyEmailRouteDefinition, publicService.routes.verifyEmailRoute, validationErrorHook);
app.openapi(forgotPasswordRouteDefinition, publicService.routes.forgotPasswordRoute, validationErrorHook);
app.openapi(resetPasswordRouteDefinition, publicService.routes.resetPasswordHandler, validationErrorHook);
app.openapi(resendVerificationEmailRouteDefinition, publicService.routes.resendVerificationEmailRoute, validationErrorHook);

// auth routes
app.openapi(logoutRouteDefinition, authService.routes.logout);
app.openapi(getCurrentUserRouteDefinition, authService.routes.getCurrentUser);
app.openapi(updateUserRouteDefinition, authService.routes.updateUser);
app.openapi(deleteUserRouteDefinition, authService.routes.deleteAccount);

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

app.post('/v3/auth/promote-test-user/:id', async (c) => {
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

// create app
app.post('/v3/admin/create-app', async (c) => {
	const token = c.req.header('Authorization')?.split(' ')[1];
	if (!token) {
		return c.json(createResponse(false, 'No token provided', 'ERR_NO_TOKEN_PROVIDED'), 401);
	}

	const { name, description, domain, userId } = await c.req.json();

	const result = await adminService.createApp(c, {
		name,
		description,
		domain,
		userId,
	});
	return c.json(result, result.status);
});

app.get('/v3/admin/apps/:userId', async (c) => {
	const token = c.req.header('Authorization')?.split(' ')[1];
	if (!token) {
		return c.json(createResponse(false, 'No token provided', 'ERR_NO_TOKEN_PROVIDED'), 401);
	}

	const userId = c.req.param('userId');
	const result = await adminService.listAppsOwnedByUser(c, { userId });
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
