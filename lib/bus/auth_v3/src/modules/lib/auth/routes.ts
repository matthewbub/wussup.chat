import { Context } from 'hono';
import { Env } from '../../../index';
import publicService from '../public';
import { createResponse } from '../../../helpers/createResponse';
import authService from '../auth';

export const authRoutes = {
	logout: async (c: Context<{ Bindings: Env }>) => {
		const token = c.req.header('Authorization')?.split(' ')[1];
		if (!token) {
			return c.json(createResponse(false, 'No token provided', 'ERR_NO_TOKEN_PROVIDED', null), 401);
		}
		const response = await authService.logout(token, c);
		return c.json(
			{
				success: response.success,
				message: response.message,
				code: response.code,
				data: null,
			},
			(response.status as 200 | 401) || 400
		);
	},
	getCurrentUser: async (c: Context<{ Bindings: Env }>) => {
		const token = c.req.header('Authorization')?.split(' ')[1];
		if (!token) {
			return c.json(createResponse(false, 'No token provided', 'ERR_NO_TOKEN_PROVIDED'), 401);
		}
		const result = await authService.getCurrentUser(token, c);
		return c.json(
			{
				success: result.success,
				message: result.message,
				code: result.code,
				data: result.data,
			},
			(result.status as 200 | 401) || 400
		);
	},
	updateUser: async (c: Context<{ Bindings: Env }>) => {
		const token = c.req.header('Authorization')?.split(' ')[1];
		if (!token) {
			return c.json(createResponse(false, 'No token provided', 'ERR_NO_TOKEN_PROVIDED'), 401);
		}
		const updates = await c.req.json();
		const result = await authService.updateUser(token, updates, c);
		return c.json(
			{
				success: result.success,
				message: result.message,
				code: result.code,
				data: result.data,
			},
			(result.status as 200 | 401) || 400
		);
	},
	deleteAccount: async (c: Context<{ Bindings: Env }>) => {
		const token = c.req.header('Authorization')?.split(' ')[1];
		if (!token) {
			return c.json(createResponse(false, 'No token provided', 'ERR_NO_TOKEN_PROVIDED'), 401);
		}
		const result = await authService.deleteAccount(token, c);
		return c.json(
			{
				success: result.success,
				message: result.message,
				code: result.code,
				data: result.data,
			},
			(result.status as 200 | 401) || 400
		);
	},
};
