import { createRoute } from '@hono/zod-openapi';
import responseService from '../modules/response';

export const updateUserRouteDefinition = createRoute({
	method: 'put',
	path: '/v3/auth/me',
	request: {
		body: {
			content: {
				'application/json': {
					schema: responseService.UpdateUserRequestSchema,
				},
			},
		},
	},
	responses: {
		200: {
			content: {
				'application/json': {
					schema: responseService.UpdateUserResponseSchema,
				},
			},
			description: 'User updated successfully',
		},
		401: {
			content: {
				'application/json': {
					schema: responseService.UpdateUserErrorSchema,
				},
			},
			description: 'Unauthorized',
		},
	},
});
