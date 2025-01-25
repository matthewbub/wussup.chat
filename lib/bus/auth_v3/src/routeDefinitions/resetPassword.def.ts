import { createRoute } from '@hono/zod-openapi';
import responseService from '../modules/response';
import { z as zOpenApi } from '@hono/zod-openapi';
export const resetPasswordRouteDefinition = createRoute({
	method: 'post',
	path: '/v3/public/reset-password',
	request: {
		body: {
			content: {
				'application/json': {
					schema: responseService.resetPasswordSchemas.request,
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
					schema: responseService.resetPasswordSchemas.response,
				},
			},
			description: 'Password reset successfully',
		},
		400: {
			content: {
				'application/json': {
					schema: responseService.resetPasswordSchemas.error,
				},
			},
			description: 'Validation error',
		},
		401: {
			content: {
				'application/json': {
					schema: responseService.resetPasswordSchemas.error,
				},
			},
			description: 'Invalid reset token',
		},
	},
});
