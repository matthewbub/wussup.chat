import { Context } from 'hono';
import { createResponse } from '../helpers/createResponse';

export default function validationErrorHook(result: any, c: Context) {
	if (!result.success) {
		return c.json(
			createResponse(
				false,
				'Validation error',
				'VALIDATION_ERROR',
				{
					errors: result.error.errors,
				},
				400
			),
			400
		);
	}
}
