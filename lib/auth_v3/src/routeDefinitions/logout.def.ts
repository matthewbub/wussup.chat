import { createRoute } from '@hono/zod-openapi';
import responseService from '../modules/response';

export const logoutRouteDefinition = createRoute({
	method: 'get',
	path: '/v3/auth/logout',
	security: [
		{
			bearerAuth: [],
		},
	],
	responses: {
		200: {
			content: {
				'application/json': {
					schema: responseService.logoutSchemas.response,
				},
			},
			description: 'Successfully logged out',
		},
		401: {
			content: {
				'application/json': {
					schema: responseService.logoutSchemas.error,
				},
			},
			description: 'Unauthorized or invalid token',
		},
	},
});
