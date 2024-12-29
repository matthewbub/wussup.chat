import { createRoute } from '@hono/zod-openapi';
import responseService from '../modules/response';

export const signupRoute = createRoute({
	method: 'post',
	path: '/v3/public/sign-up',
	request: {
		body: {
			content: {
				'application/json': {
					schema: responseService.signupSchemas.request,
				},
			},
			required: true,
		},
	},
	responses: {
		200: {
			content: {
				'application/json': {
					schema: responseService.signupSchemas.response,
				},
			},
			description: 'Signup successful',
		},
		400: {
			content: {
				'application/json': {
					schema: responseService.signupSchemas.error,
				},
			},
			description: 'Validation error',
		},
		409: {
			content: {
				'application/json': {
					schema: responseService.signupSchemas.error,
				},
			},
			description: 'Email already in use',
		},
	},
});
