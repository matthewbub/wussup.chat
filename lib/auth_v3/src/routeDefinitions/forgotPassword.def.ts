import { createRoute } from '@hono/zod-openapi';
import responseService from '../modules/response';
import { z as zOpenApi } from '@hono/zod-openapi';

export const forgotPasswordRouteDefinition = createRoute({
	method: 'post',
	path: '/v3/public/forgot-password',
	request: {
		body: {
			content: {
				'application/json': {
					schema: responseService.forgotPasswordSchemas.request,
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
					schema: responseService.forgotPasswordSchemas.response,
				},
			},
			description: 'Password reset initiated successfully',
		},
		400: {
			content: {
				'application/json': {
					schema: responseService.forgotPasswordSchemas.error,
				},
			},
			description: 'Validation error',
		},
	},
});
