import { createRoute } from '@hono/zod-openapi';
import { z as zOpenApi } from '@hono/zod-openapi';
import { OpenAPIHono } from '@hono/zod-openapi';

// types for route configuration
type RouteConfig = {
	method: 'get' | 'post' | 'put' | 'delete';
	path: string;
	schemas: {
		request?: any;
		response: any;
		error: any;
	};
	description: string;
	requiresAppId?: boolean;
};

/**
 * RouteDefinitionFactory creates standardized route definitions for the api.
 * It implements the factory pattern to encapsulate route creation logic.
 */
class RouteDefinitionFactory {
	/**
	 * creates a protected route that requires authentication
	 * @param config - route configuration including method, path, schemas, and description
	 * @returns openapi route definition
	 */
	protected createProtectedRoute(config: RouteConfig): OpenAPIHono {
		return createRoute({
			method: config.method,
			path: config.path,
			security: [{ bearerAuth: [] }],
			...(config.schemas.request && {
				request: {
					body: {
						content: {
							'application/json': {
								schema: config.schemas.request,
							},
						},
						required: true,
					},
				},
			}),
			responses: {
				200: {
					content: {
						'application/json': {
							schema: config.schemas.response,
						},
					},
					description: config.description,
				},
				401: {
					content: {
						'application/json': {
							schema: config.schemas.error,
						},
					},
					description: 'Unauthorized',
				},
			},
		});
	}

	/**
	 * creates a public route that doesn't require authentication
	 * @param config - route configuration including method, path, schemas, and description
	 * @returns openapi route definition
	 */
	protected createPublicRoute(config: RouteConfig): OpenAPIHono {
		const headers = config.requiresAppId
			? {
					headers: zOpenApi.object({
						'x-app-id': zOpenApi.string().optional().openapi({
							description: 'Unique identifier for the application',
						}),
					}),
				}
			: {};

		return createRoute({
			method: config.method,
			path: config.path,
			...(config.schemas.request && {
				request: {
					body: {
						content: {
							'application/json': {
								schema: config.schemas.request,
							},
						},
						required: true,
					},
					...headers,
				},
			}),
			responses: {
				200: {
					content: {
						'application/json': {
							schema: config.schemas.response,
						},
					},
					description: config.description,
				},
				400: {
					content: {
						'application/json': {
							schema: config.schemas.error,
						},
					},
					description: 'Validation error',
				},
			},
		});
	}
}

// export singleton instance
export const routeDefinitionFactory = new RouteDefinitionFactory();
