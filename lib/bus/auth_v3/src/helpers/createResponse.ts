import { StatusCode } from 'hono/utils/http-status';

export const createResponse = (success: boolean, message: string, code: string, data: any = null, status: StatusCode = 200) => ({
	success,
	message,
	code,
	data,
	status,
});
