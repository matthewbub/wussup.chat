import { createRoute } from '@hono/zod-openapi';
import responseService from '../modules/response';
import openApiSchemas from '../openapi';

export const getCurrentUserRouteDefinition = createRoute({
	method: 'get',
	path: '/v3/auth/me',
	security: [{ bearerAuth: [] }],
	headers: openApiSchemas.commonHeadersSchemas,
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
