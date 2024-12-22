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
	refreshSchema: z.object({
		refreshToken: z.string().min(1).max(255),
	}),
};

export default responseService;
