import { z } from 'zod';
import { z as zOpenApi } from '@hono/zod-openapi';

// types for schema configuration
type SchemaConfig = {
	successExample?: boolean;
	successMessage?: string;
	dataSchema?: any;
};

/**
 * schemabuilder provides methods for creating consistent openapi schema definitions.
 * it implements the builder pattern to construct complex schema objects with a fluent interface.
 */
class SchemaBuilder {
	/**
	 * creates a standard response schema with configurable success state and data
	 * @param name - the name of the schema for openapi documentation
	 * @param config - configuration object containing success state, message and data schema
	 * @returns zod openapi schema for response
	 */
	static createResponseSchema(name: string, config: SchemaConfig) {
		const { successExample = true, successMessage = 'Request successful', dataSchema = null } = config;

		return zOpenApi
			.object({
				success: zOpenApi.boolean().openapi({
					example: successExample,
					description: 'Whether the request was successful',
				}),
				message: zOpenApi.string().openapi({
					example: successMessage,
					description: 'Message describing the result of the request',
				}),
				code: zOpenApi.string().openapi({
					example: successExample ? '200' : '400',
					description: 'HTTP status code',
				}),
				data: dataSchema
					? dataSchema.openapi({
							description: 'Data returned by the server',
						})
					: zOpenApi.null().openapi({
							description: 'Data returned by the server',
						}),
			})
			.openapi(name);
	}

	/**
	 * creates a request schema with specified fields
	 * @param name - the name of the schema for openapi documentation
	 * @param fields - record of field definitions
	 * @returns zod openapi schema for request
	 */
	static createRequestSchema(name: string, fields: Record<string, any>) {
		return zOpenApi.object(fields).openapi(name);
	}

	/**
	 * creates a password validation schema with standard security requirements
	 * @returns zod schema with password validation rules
	 */
	static createPasswordSchema() {
		return z
			.string()
			.min(8, { message: 'Password must be at least 8 characters' })
			.max(20, { message: 'Password must not exceed 20 characters' })
			.refine((password) => /[A-Z]/.test(password), {
				message: 'Password must contain at least one uppercase letter',
			})
			.refine((password) => /[a-z]/.test(password), {
				message: 'Password must contain at least one lowercase letter',
			})
			.refine((password) => /[0-9]/.test(password), {
				message: 'Password must contain at least one number',
			})
			.refine((password) => /[!@#$%^&*]/.test(password), {
				message: 'Password must contain at least one special character (!@#$%^&*)',
			});
	}

	/**
	 * creates a standard auth token response schema
	 * @returns zod openapi schema for auth tokens
	 */
	static createAuthTokenResponseSchema() {
		return zOpenApi.object({
			access_token: zOpenApi.string(),
			token_type: zOpenApi.literal('Bearer'),
			expires_in: zOpenApi.number(),
			verificationToken: zOpenApi.string().optional(),
		});
	}
}
