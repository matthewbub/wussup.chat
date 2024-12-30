import { Context } from 'hono';
import { Env } from '../../../index';
import publicService from '../public';
import { createResponse } from '../../../helpers/createResponse';

export const publicRoutesService = {
	signUpRoute: async (c: Context<{ Bindings: Env }>) => {
		const appId = c.req.header('x-app-id');
		const { email, password, confirmPassword } = await c.req.json();
		const response = await publicService.signUp({ email, password, confirmPassword, appId: appId || null }, c);

		if (!response.success) {
			return c.json(response, response.status as 400 | 409);
		}
		return c.json(response, 200);
	},
	loginRoute: async (c: Context<{ Bindings: Env }>) => {
		const appId = c.req.header('x-app-id');
		const { email, password } = await c.req.json();
		const response = await publicService.login({ email, password, appId: appId || null }, c);
		return c.json(
			{
				success: response.success,
				message: response.message,
				code: response.code,
				data: response.data,
			},
			response.success ? 200 : 401
		);
	},
	refreshTokenRoute: async (c: Context<{ Bindings: Env }>) => {
		const { refreshToken } = await c.req.json();
		const response = await publicService.refreshToken({ refreshToken }, c);
		return c.json(
			{
				success: response.success,
				message: response.message,
				code: response.code,
				data: response.data,
			},
			response.success ? 200 : 401
		);
	},
	verifyEmailRoute: async (c: Context<{ Bindings: Env }>) => {
		const { token } = await c.req.json();
		const response = await publicService.verifyEmail({ token }, c);
		return c.json(
			{
				success: response.success,
				message: response.message,
				code: response.code,
				data: response.data,
			},
			response.success ? 200 : 401
		);
	},
	forgotPasswordRoute: async (c: Context<{ Bindings: Env }>) => {
		const { email } = await c.req.json();
		const response = await publicService.forgotPassword({ email }, c);
		return c.json(
			{
				success: response.success,
				message: response.message,
				code: response.code,
				data: response.data,
			},
			response.success ? 200 : 400
		);
	},
	resetPasswordHandler: async (c: Context<{ Bindings: Env }>) => {
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
	},
	resendVerificationEmailRoute: async (c: Context<{ Bindings: Env }>) => {
		const { email } = await c.req.json();
		const response = await publicService.resendVerificationEmail({ email }, c);
		return c.json(
			{
				success: response.success,
				message: response.message,
				code: response.code,
				data: response.data,
			},
			(response.status as 200 | 400) || 409
		);
	},
};
