import { z as zOpenApi } from '@hono/zod-openapi';

const forgotPasswordErrorSchema = zOpenApi
	.object({
		success: zOpenApi.boolean().openapi({
			example: true,
			description: 'Whether the request was successful',
		}),
		message: zOpenApi.string().openapi({
			example: 'Password reset initiated successfully',
			description: 'Message describing the result of the request',
		}),
		code: zOpenApi.string().openapi({
			example: '200',
			description: 'HTTP status code',
		}),
		data: zOpenApi
			.object({
				errors: zOpenApi.array(
					zOpenApi.object({
						message: zOpenApi.string().openapi({
							example: 'Password reset initiated successfully',
							description: 'Message describing the result of the request',
						}),
						path: zOpenApi.array(zOpenApi.string()).openapi({
							example: ['email'],
							description: 'Path to the field that caused the error',
						}),
					})
				),
			})
			.optional(),
	})
	.openapi('ForgotPasswordError');

const forgotPasswordResponseSchema = zOpenApi
	.object({
		success: zOpenApi.boolean().openapi({
			example: true,
			description: 'Whether the request was successful',
		}),
		message: zOpenApi.string().openapi({
			example: 'Password reset initiated successfully',
			description: 'Message describing the result of the request',
		}),
		code: zOpenApi.string().openapi({
			example: '200',
			description: 'HTTP status code',
		}),
		data: zOpenApi.null(),
	})
	.openapi('ForgotPasswordResponse');

const forgotPasswordRequestSchema = zOpenApi
	.object({
		email: zOpenApi.string().email().openapi({
			example: 'user@example.com',
			description: "User's email address",
		}),
	})
	.openapi('ForgotPasswordRequest');

const forgotPassword = {
	request: forgotPasswordRequestSchema,
	response: forgotPasswordResponseSchema,
	error: forgotPasswordErrorSchema,
};

export default forgotPassword;
