export const createResponse = (success: boolean, message: string, code: string, data: any = null) => ({
	success,
	message,
	code,
	data,
});
