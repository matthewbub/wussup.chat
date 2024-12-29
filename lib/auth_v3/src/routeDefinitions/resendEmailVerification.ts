import { createRoute } from '@hono/zod-openapi';
import responseService from '../modules/response';

export const resendVerificationEmailRouteDefinition = createRoute({
	method: 'post',
	path: '/v3/public/resend-verification-email',
	request: {
		body: {
			content: {
				'application/json': {
					schema: responseService.resendVerificationEmailSchemas.request,
				},
			},
			required: true,
		},
	},
	responses: {
		200: {
			content: {
				'application/json': {
					schema: responseService.resendVerificationEmailSchemas.response,
				},
			},
			description: 'Verification email sent successfully',
		},
		400: {
			content: {
				'application/json': {
					schema: responseService.resendVerificationEmailSchemas.error,
				},
			},
			description: 'Validation error',
		},
		401: {
			content: {
				'application/json': {
					schema: responseService.resendVerificationEmailSchemas.error,
				},
			},
			description: 'Rate limit exceeded or unable to resend',
		},
	},
});
