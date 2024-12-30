import { createRoute } from '@hono/zod-openapi';
import responseService from '../modules/response';
import { z as zOpenApi } from '@hono/zod-openapi';

export const signupRouteDefinition = createRoute({
	method: 'post',
	path: '/v3/public/sign-up',
	request: {
		body: {
			content: {
				'application/json': {
					schema: responseService.signupSchemas.request,
				},
			},
			required: true,
		},
		headers: zOpenApi.object({
			'x-app-id': zOpenApi.string().optional().openapi({
				description: 'Unique identifier for the application',
			}),
		}),
	},
	responses: {
		200: {
			content: {
				'application/json': {
					schema: responseService.signupSchemas.response,
				},
			},
			description: 'Signup successful',
		},
		400: {
			content: {
				'application/json': {
					schema: responseService.signupSchemas.error,
				},
			},
			description: 'Validation error',
		},
		401: {
			content: {
				'application/json': {
					schema: responseService.signupSchemas.error,
				},
			},
			description: 'Unauthorized',
		},
		409: {
			content: {
				'application/json': {
					schema: responseService.signupSchemas.error,
				},
			},
			description: 'Email already in use',
		},
	},
});
