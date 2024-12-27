import { Context } from 'hono';
import { createResponse } from './createResponse';
import { ZodError } from 'zod';
export function commonErrorHandler(error: unknown, c: Context) {
	if (error instanceof ZodError) {
		// map each error to a structured object
		const issues = error.errors.map((err) => ({
			message: err.message,
			path: err.path,
			code: err.code,
		}));
		// return a structured response with all issues
		return c.json(createResponse(false, 'Validation error', 'VALIDATION_ERROR', { issues }), 400);
	}
	return c.json(createResponse(false, error instanceof Error ? error.message : 'Unknown error', 'UNEXPECTED_ERROR'), 500);
}
