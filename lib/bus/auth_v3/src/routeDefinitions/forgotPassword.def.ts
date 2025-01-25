import { createRoute } from '@hono/zod-openapi';
import responseService from '../modules/response';
import openApiSchemas from '../openapi';

export const forgotPasswordRouteDefinition = createRoute({
	method: 'post',
	path: '/v3/public/forgot-password',
	request: {
		body: {
			content: {
				'application/json': {
					schema: openApiSchemas.forgotPasswordSchemas.request,
				},
			},
			required: true,
		},
		headers: openApiSchemas.commonHeadersSchemas,
	},
	responses: {
		200: {
			content: {
				'application/json': {
					schema: openApiSchemas.forgotPasswordSchemas.response,
				},
			},
			description: 'Password reset initiated successfully',
		},
		400: {
			content: {
				'application/json': {
					schema: openApiSchemas.forgotPasswordSchemas.error,
				},
			},
			description: 'Validation error',
		},
	},
});
