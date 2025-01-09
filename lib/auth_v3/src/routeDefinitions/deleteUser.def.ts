import { createRoute } from '@hono/zod-openapi';
import responseService from '../modules/response';
import openApiSchemas from '../openapi';

export const deleteUserRouteDefinition = createRoute({
	method: 'delete',
	path: '/v3/auth/me',
	headers: openApiSchemas.commonHeadersSchemas,
	responses: {
		200: {
			content: {
				'application/json': {
					schema: responseService.DeleteUserResponseSchema,
				},
			},
			description: 'Account deleted successfully',
		},
		401: {
			content: {
				'application/json': {
					schema: responseService.DeleteUserErrorSchema,
				},
			},
			description: 'Unauthorized',
		},
	},
});
