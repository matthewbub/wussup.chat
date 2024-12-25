import { z } from 'zod';

// error messages for password validation
const minLengthErrorMessage = 'Password must be at least 8 characters';
const maxLengthErrorMessage = 'Password must not exceed 20 characters';
const uppercaseErrorMessage = 'Password must contain at least one uppercase letter';
const lowercaseErrorMessage = 'Password must contain at least one lowercase letter';
const numberErrorMessage = 'Password must contain at least one number';
const specialCharacterErrorMessage = 'Password must contain at least one special character (!@#$%^&*)';

// password validation schema
const passwordSchema = z
	.string()
	.min(8, { message: minLengthErrorMessage })
	.max(20, { message: maxLengthErrorMessage })
	.refine((password) => /[A-Z]/.test(password), {
		message: uppercaseErrorMessage,
	})
	.refine((password) => /[a-z]/.test(password), {
		message: lowercaseErrorMessage,
	})
	.refine((password) => /[0-9]/.test(password), { message: numberErrorMessage })
	.refine((password) => /[!@#$%^&*]/.test(password), {
		message: specialCharacterErrorMessage,
	});

const responseService = {
	signUpSchema: z
		.object({
			email: z.string().email().max(255),
			password: passwordSchema,
			confirmPassword: passwordSchema,
		})
		.refine((data) => data.password === data.confirmPassword, {
			message: "Passwords don't match",
			path: ['confirmPassword'],
		}),
	loginSchema: z.object({
		email: z.string().email().max(255),
		password: passwordSchema,
	}),
	refreshSchema: z.object({
		refreshToken: z.string().min(1).max(255),
	}),
	verifyEmailSchema: z.object({
		token: z.string().min(1).max(255),
	}),
	forgotPasswordSchema: z.object({
		email: z.string().email().max(255),
	}),
	resendForgotPasswordSchema: z.object({
		email: z.string().email().max(255),
	}),
	resendVerificationEmailSchema: z.object({
		email: z.string().email().max(255),
	}),
	resetPasswordSchema: z
		.object({
			token: z.string().min(1).max(255),
			password: passwordSchema,
			confirmPassword: passwordSchema,
		})
		.refine((data) => data.password === data.confirmPassword, {
			message: "Passwords don't match",
			path: ['confirmPassword'],
		}),
	updateUserSchema: z
		.object({
			email: z.string().email().max(255).optional(),
			username: z.string().min(3).max(255).optional(),
		})
		.refine((data) => data.email !== undefined || data.username !== undefined, {
			message: 'At least one field (email or username) must be provided',
		}),
};

export default responseService;
