import { createRoute } from '@hono/zod-openapi';
import responseService from '../modules/response';

export const refreshTokenRouteDefinition = createRoute({
	method: 'post',
	path: '/v3/public/refresh-token',
	request: {
		body: {
			content: {
				'application/json': {
					schema: responseService.refreshTokenSchemas.request,
				},
			},
			required: true,
		},
	},
	responses: {
		200: {
			content: {
				'application/json': {
					schema: responseService.refreshTokenSchemas.response,
				},
			},
			description: 'Token refreshed successfully',
		},
		401: {
			content: {
				'application/json': {
					schema: responseService.refreshTokenSchemas.error,
				},
			},
			description: 'Invalid refresh token',
		},
		400: {
			content: {
				'application/json': {
					schema: responseService.refreshTokenSchemas.error,
				},
			},
			description: 'Validation error',
		},
	},
});
