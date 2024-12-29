import { createRoute } from '@hono/zod-openapi';
import responseService from '../modules/response';

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
