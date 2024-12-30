import { createRoute } from '@hono/zod-openapi';
import responseService from '../modules/response';

export const getCurrentUserRouteDefinition = createRoute({
	method: 'get',
	path: '/v3/auth/me',
	security: [{ bearerAuth: [] }],
	responses: {
		200: {
			content: {
				'application/json': {
					schema: responseService.getCurrentUserSchemas.response,
				},
			},
			description: 'User retrieved successfully',
		},
		401: {
			content: {
				'application/json': {
					schema: responseService.getCurrentUserSchemas.error,
				},
			},
			description: 'Unauthorized',
		},
	},
});
