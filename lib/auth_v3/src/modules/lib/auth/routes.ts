import { Context } from 'hono';
import { Env } from '../../../index';
import publicService from '../public';

export const resetPasswordHandler = async (c: Context<{ Bindings: Env }>) => {
	const { token, password, confirmPassword } = await c.req.json();
	const response = await publicService.resetPassword(
		{
			token,
			password,
			confirmPassword,
		},
		c
	);
	return c.json(
		{
			success: response.success,
			message: response.message,
			code: response.code,
			data: response.data,
		},
		response.code === 'INVALID_RESET_TOKEN' ? 401 : (response.status as 200 | 400) || 409
	);
};
