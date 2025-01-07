import { z as zOpenApi } from '@hono/zod-openapi';

const loginRequestSchema = zOpenApi
	.object({
		email: zOpenApi.string().email().openapi({
			example: 'user@example.com',
			description: "User's email address",
		}),
		password: zOpenApi.string().min(8).openapi({
			example: 'TestPassword123!',
			description: "User's password",
		}),
	})
	.openapi('loginRequest');

const loginResponseSchema = zOpenApi
	.object({
		success: zOpenApi.boolean().openapi({
			example: true,
			description: 'Whether the request was successful',
		}),
		message: zOpenApi.string().openapi({
			example: 'Login successful',
			description: 'Message describing the result of the request',
		}),
		code: zOpenApi.string().openapi({
			example: '200',
			description: 'HTTP status code',
		}),
		data: zOpenApi
			.object({
				access_token: zOpenApi.string().openapi({
					example: '1234567890',
					description: 'Access token',
				}),
				token_type: zOpenApi.literal('Bearer').openapi({
					example: 'Bearer',
					description: 'Token type',
				}),
				expires_in: zOpenApi.number().openapi({
					example: 3600,
					description: 'Token expiration time in seconds',
				}),
			})
			.optional(),
	})
	.openapi('loginResponse');

const loginErrorSchema = zOpenApi
	.object({
		success: zOpenApi.boolean().openapi({
			example: false,
			description: 'Whether the request was successful',
		}),
		message: zOpenApi.string().openapi({
			example: 'Invalid credentials',
			description: 'Message describing the error',
		}),
		code: zOpenApi.string().openapi({
			example: '401',
			description: 'HTTP status code',
		}),
		data: zOpenApi
			.object({
				lockedUntil: zOpenApi.string().nullable().openapi({
					example: '2025-01-01T00:00:00Z',
					description: 'Date and time when the user account will be unlocked',
				}),
			})
			.optional(),
	})
	.openapi('loginError');

const login = {
	request: loginRequestSchema,
	response: loginResponseSchema,
	error: loginErrorSchema,
};

export default login;
