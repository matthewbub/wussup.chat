import { createRoute } from '@hono/zod-openapi';
import responseService from '../modules/response';
import openApiSchemas from '../openapi';

export const loginRouteDefinition = createRoute({
	method: 'post',
	path: '/v3/public/login',
	headers: openApiSchemas.commonHeadersSchemas,
	request: {
		body: {
			content: {
				'application/json': {
					schema: openApiSchemas.loginSchemas.request,
				},
			},
			required: true,
		},
	},
	responses: {
		200: {
			content: {
				'application/json': {
					schema: openApiSchemas.loginSchemas.response,
				},
			},
			description: 'Login successful',
		},
		401: {
			content: {
				'application/json': {
					schema: openApiSchemas.loginSchemas.error,
				},
			},
			description: 'Invalid credentials',
		},
		403: {
			content: {
				'application/json': {
					schema: openApiSchemas.loginSchemas.error,
				},
			},
			description: 'Account suspended or deleted',
		},
		404: {
			content: {
				'application/json': {
					schema: openApiSchemas.loginSchemas.error,
				},
			},
			description: 'User not found',
		},
		400: {
			content: {
				'application/json': {
					schema: openApiSchemas.loginSchemas.error,
				},
			},
			description: 'Validation error',
		},
	},
});
