import { createRoute } from '@hono/zod-openapi';
import responseService from '../modules/response';

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
