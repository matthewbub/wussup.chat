import { Context } from 'hono';
import { z } from 'zod';

const responseService = {
	signUpSchema: z.object({
		email: z.string().email().max(255),
		password: z.string().min(8).max(255),
		confirmPassword: z.string().min(8).max(255),
	}),
	loginSchema: z.object({
		email: z.string().email().max(255),
		password: z.string().min(8).max(255),
	}),
	error: (c: Context, error: any) => {
		return c.json({ error: error instanceof Error ? error.message : 'Unknown error' }, 500);
	},
};

export default responseService;
