import { Context } from 'hono';
import { createResponse } from './createResponse';
import { ZodError } from 'zod';
import { HTTPException } from 'hono/http-exception';

export function commonErrorHandler(error: unknown, c: Context) {
	if (error instanceof ZodError) {
		// map each error to a structured object
		const issues = error.errors.map((err) => ({
			message: err.message,
			path: err.path,
			code: err.code,
		}));
		// return a structured response with all issues
		return createResponse(false, 'Validation error', 'VALIDATION_ERROR', { issues }, 400);
	}
	return createResponse(false, error instanceof Error ? error.message : 'Unknown error', 'UNEXPECTED_ERROR', null, 500);
}

// export const commonErrorResponse = (error: unknown, c: Context) => {
// 	console.log('commonErrorResponse', error);
// 	console.log('commonErrorHandler', commonErrorHandler(error, c));
// 	return c.json(commonErrorHandler(error, c), commonErrorHandler(error, c).status);
// };

export const commonErrorResponse = (err: Error, c: Context) => {
	// Handle bearer auth errors
	if (err instanceof HTTPException) {
		return c.json(createResponse(false, err.message || 'Unauthorized', 'UNAUTHORIZED', null, err.status), err.status);
	}

	// Handle validation errors
	if (err instanceof ZodError) {
		return c.json(
			createResponse(
				false,
				'Validation error',
				'VALIDATION_ERROR',
				{
					errors: err.errors,
				},
				400
			),
			400
		);
	}

	// Handle other errors
	return c.json(createResponse(false, err.message || 'Internal server error', 'INTERNAL_SERVER_ERROR', null, 500), 500);
};
