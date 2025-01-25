import { z as zOpenApi } from '@hono/zod-openapi';

const commonHeadersSchemas = zOpenApi
	.object({
		'x-app-id': zOpenApi.string().openapi({
			description: 'Unique identifier for the application',
		}),
	})
	.openapi('CommonHeaders');

export default commonHeadersSchemas;
