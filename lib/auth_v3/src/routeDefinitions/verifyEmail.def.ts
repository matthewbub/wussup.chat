import { createRoute } from '@hono/zod-openapi';
import responseService from '../modules/response';

export const verifyEmailRouteDefinition = createRoute({
	method: 'post',
	path: '/v3/public/verify-email',
	request: {
		body: {
			content: {
				'application/json': {
					schema: responseService.verifyEmailSchemas.request,
				},
			},
			required: true,
		},
	},
	responses: {
		200: {
			content: {
				'application/json': {
					schema: responseService.verifyEmailSchemas.response,
				},
			},
			description: 'Email verified successfully',
		},
		401: {
			content: {
				'application/json': {
					schema: responseService.verifyEmailSchemas.error,
				},
			},
			description: 'Invalid or expired token',
		},
		400: {
			content: {
				'application/json': {
					schema: responseService.verifyEmailSchemas.error,
				},
			},
			description: 'Validation error',
		},
	},
});
