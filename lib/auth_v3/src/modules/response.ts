import { z } from 'zod';
import { z as zOpenApi } from '@hono/zod-openapi';

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

const LoginRequestSchema = zOpenApi
	.object({
		email: zOpenApi.string().email().openapi({
			example: 'user@example.com',
			description: "User's email address",
		}),
		password: zOpenApi.string().min(8).openapi({
			example: 'TestPassword123!',
			description: "User's password",
		}),
	})
	.openapi('LoginRequest');

const LoginResponseSchema = zOpenApi
	.object({
		success: zOpenApi.boolean(),
		message: zOpenApi.string(),
		code: zOpenApi.string(),
		data: zOpenApi
			.object({
				access_token: zOpenApi.string(),
				token_type: zOpenApi.literal('Bearer'),
				expires_in: zOpenApi.number(),
			})
			.optional(),
	})
	.openapi('LoginResponse');

const LoginErrorSchema = zOpenApi
	.object({
		success: zOpenApi.boolean(),
		message: zOpenApi.string(),
		code: zOpenApi.string(),
		data: zOpenApi
			.object({
				lockedUntil: zOpenApi.string().nullable(),
			})
			.optional(),
	})
	.openapi('LoginError');

const SignupRequestSchema = zOpenApi
	.object({
		email: zOpenApi.string().email().max(255).openapi({
			example: 'user@example.com',
			description: "User's email address",
		}),
		password: zOpenApi.string().min(8).max(20).openapi({
			example: 'TestPassword123!',
			description: 'Password meeting security requirements',
		}),
		confirmPassword: zOpenApi.string().min(8).max(20).openapi({
			example: 'TestPassword123!',
			description: 'Must match password field',
		}),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords don't match",
		path: ['confirmPassword'],
	})
	.openapi('SignupRequest');

const SignupResponseSchema = zOpenApi
	.object({
		success: zOpenApi.boolean(),
		message: zOpenApi.string(),
		code: zOpenApi.string(),
		data: zOpenApi
			.object({
				access_token: zOpenApi.string(),
				token_type: zOpenApi.literal('Bearer'),
				expires_in: zOpenApi.number(),
				verificationToken: zOpenApi.string().optional(),
			})
			.optional(),
	})
	.openapi('SignupResponse');

const SignupErrorSchema = zOpenApi
	.object({
		success: zOpenApi.boolean(),
		message: zOpenApi.string(),
		code: zOpenApi.string(),
		data: zOpenApi
			.object({
				errors: zOpenApi.array(
					zOpenApi.object({
						message: zOpenApi.string(),
						path: zOpenApi.array(zOpenApi.string()),
						code: zOpenApi.string(),
						validation: zOpenApi.string().optional(),
						type: zOpenApi.string().optional(),
						exact: zOpenApi.boolean().optional(),
						inclusive: zOpenApi.boolean().optional(),
						minimum: zOpenApi.number().optional(),
					})
				),
			})
			.optional(),
	})
	.openapi('SignupError');

const RefreshTokenRequestSchema = zOpenApi
	.object({
		refreshToken: zOpenApi.string().min(1).openapi({
			example: 'eyJhbGciOiJIUzI1NiIs...',
			description: 'Refresh token received from login or previous refresh',
		}),
	})
	.openapi('RefreshTokenRequest');

const RefreshTokenResponseSchema = zOpenApi
	.object({
		success: zOpenApi.boolean(),
		message: zOpenApi.string(),
		code: zOpenApi.string(),
		data: zOpenApi
			.object({
				access_token: zOpenApi.string(),
				token_type: zOpenApi.literal('Bearer'),
				expires_in: zOpenApi.number(),
			})
			.optional(),
	})
	.openapi('RefreshTokenResponse');

const RefreshTokenErrorSchema = zOpenApi
	.object({
		success: zOpenApi.boolean(),
		message: zOpenApi.string(),
		code: zOpenApi.string(),
		data: zOpenApi.null(),
	})
	.openapi('RefreshTokenError');

const VerifyEmailRequestSchema = zOpenApi
	.object({
		token: zOpenApi.string().min(1).openapi({
			example: 'verification_token_123',
			description: 'Email verification token',
		}),
	})
	.openapi('VerifyEmailRequest');

const VerifyEmailResponseSchema = zOpenApi
	.object({
		success: zOpenApi.boolean(),
		message: zOpenApi.string(),
		code: zOpenApi.string(),
		data: zOpenApi.null(),
	})
	.openapi('VerifyEmailResponse');

const VerifyEmailErrorSchema = zOpenApi
	.object({
		success: zOpenApi.boolean(),
		message: zOpenApi.string(),
		code: zOpenApi.string(),
		data: zOpenApi.null(),
	})
	.openapi('VerifyEmailError');

const ForgotPasswordRequestSchema = zOpenApi
	.object({
		email: zOpenApi.string().email().openapi({
			example: 'user@example.com',
			description: "User's email address",
		}),
	})
	.openapi('ForgotPasswordRequest');

const ForgotPasswordResponseSchema = zOpenApi
	.object({
		success: zOpenApi.boolean(),
		message: zOpenApi.string(),
		code: zOpenApi.string(),
		data: zOpenApi.null(),
	})
	.openapi('ForgotPasswordResponse');

const ForgotPasswordErrorSchema = zOpenApi
	.object({
		success: zOpenApi.boolean(),
		message: zOpenApi.string(),
		code: zOpenApi.string(),
		data: zOpenApi
			.object({
				errors: zOpenApi.array(
					zOpenApi.object({
						message: zOpenApi.string(),
						path: zOpenApi.array(zOpenApi.string()),
					})
				),
			})
			.optional(),
	})
	.openapi('ForgotPasswordError');

const ResetPasswordRequestSchema = zOpenApi
	.object({
		token: zOpenApi.string().min(1).openapi({
			example: 'reset_token_123',
			description: 'Password reset token',
		}),
		password: zOpenApi.string().min(8).max(20).openapi({
			example: 'NewPassword123!',
			description: 'New password meeting security requirements',
		}),
		confirmPassword: zOpenApi.string().min(8).max(20).openapi({
			example: 'NewPassword123!',
			description: 'Must match password field',
		}),
	})
	.openapi('ResetPasswordRequest');

const ResetPasswordResponseSchema = zOpenApi
	.object({
		success: zOpenApi.boolean(),
		message: zOpenApi.string(),
		code: zOpenApi.string(),
		data: zOpenApi.null(),
	})
	.openapi('ResetPasswordResponse');

const ResetPasswordErrorSchema = zOpenApi
	.object({
		success: zOpenApi.boolean(),
		message: zOpenApi.string(),
		code: zOpenApi.string(),
		data: zOpenApi.null(),
	})
	.openapi('ResetPasswordError');

const ResendVerificationEmailRequestSchema = zOpenApi
	.object({
		email: zOpenApi.string().email().openapi({
			example: 'user@example.com',
			description: "User's email address",
		}),
	})
	.openapi('ResendVerificationEmailRequest');

const ResendVerificationEmailResponseSchema = zOpenApi
	.object({
		success: zOpenApi.boolean(),
		message: zOpenApi.string(),
		code: zOpenApi.string(),
		data: zOpenApi.null(),
	})
	.openapi('ResendVerificationEmailResponse');

const ResendVerificationEmailErrorSchema = zOpenApi
	.object({
		success: zOpenApi.boolean(),
		message: zOpenApi.string(),
		code: zOpenApi.string(),
		data: zOpenApi.null(),
	})
	.openapi('ResendVerificationEmailError');

const LogoutResponseSchema = zOpenApi
	.object({
		success: zOpenApi.boolean(),
		message: zOpenApi.string(),
		code: zOpenApi.string(),
		data: zOpenApi.null(),
	})
	.openapi('LogoutResponse');

const LogoutErrorSchema = zOpenApi
	.object({
		success: zOpenApi.boolean(),
		message: zOpenApi.string(),
		code: zOpenApi.string(),
		data: zOpenApi.null(),
	})
	.openapi('LogoutError');

const UpdateUserRequestSchema = zOpenApi
	.object({
		email: zOpenApi.string().email().max(255).optional(),
		username: zOpenApi.string().min(3).max(255).optional(),
	})
	.openapi('UpdateUserRequest');

const UpdateUserResponseSchema = zOpenApi
	.object({
		success: zOpenApi.boolean(),
		message: zOpenApi.string(),
		code: zOpenApi.string(),
		data: zOpenApi
			.object({
				user: zOpenApi.object({
					email: zOpenApi.string().optional(),
					username: zOpenApi.string().optional(),
				}),
			})
			.optional(),
	})
	.openapi('UpdateUserResponse');

const UpdateUserErrorSchema = zOpenApi
	.object({
		success: zOpenApi.boolean(),
		message: zOpenApi.string(),
		code: zOpenApi.string(),
		data: zOpenApi.null(),
	})
	.openapi('UpdateUserError');

const DeleteUserResponseSchema = zOpenApi
	.object({
		success: zOpenApi.boolean(),
		message: zOpenApi.string(),
		code: zOpenApi.string(),
		data: zOpenApi.null(),
	})
	.openapi('DeleteUserResponse');

const DeleteUserErrorSchema = zOpenApi
	.object({
		success: zOpenApi.boolean(),
		message: zOpenApi.string(),
		code: zOpenApi.string(),
		data: zOpenApi.null(),
	})
	.openapi('DeleteUserError');

const GetCurrentUserResponseSchema = zOpenApi
	.object({
		success: zOpenApi.boolean(),
		message: zOpenApi.string(),
		code: zOpenApi.string(),
		data: zOpenApi.object({
			id: zOpenApi.string(),
			email: zOpenApi.string(),
			username: zOpenApi.string(),
			status: zOpenApi.string(),
			role: zOpenApi.string(),
			email_verified: zOpenApi.number(),
			last_login_at: zOpenApi.string().nullable(),
			created_at: zOpenApi.string(),
		}),
	})
	.openapi('GetCurrentUserResponse');

const GetCurrentUserErrorSchema = zOpenApi
	.object({
		success: zOpenApi.boolean(),
		message: zOpenApi.string(),
		code: zOpenApi.string(),
		data: zOpenApi.null(),
	})
	.openapi('GetCurrentUserError');

const responseService = {
	signUpSchema: z
		.object({
			email: z.string().email().max(255),
			password: passwordSchema,
			confirmPassword: passwordSchema,
			appId: z.string().min(1).max(255).optional().nullable(),
		})
		.refine((data) => data.password === data.confirmPassword, {
			message: "Passwords don't match",
			path: ['confirmPassword'],
		}),
	loginSchema: z.object({
		email: z.string().email().max(255),
		password: passwordSchema,
	}),
	loginSchemas: {
		request: LoginRequestSchema,
		response: LoginResponseSchema,
		error: LoginErrorSchema,
	},
	refreshSchema: z.object({
		refreshToken: z.string().min(1).max(255),
	}),
	verifyEmailSchema: z.object({
		token: z.string().min(1).max(255),
	}),
	forgotPasswordSchema: z.object({
		email: z.string().email().max(255),
	}),
	forgotPasswordSchemas: {
		request: ForgotPasswordRequestSchema,
		response: ForgotPasswordResponseSchema,
		error: ForgotPasswordErrorSchema,
	},
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
	signupSchemas: {
		request: SignupRequestSchema,
		response: SignupResponseSchema,
		error: SignupErrorSchema,
	},
	refreshTokenSchemas: {
		request: RefreshTokenRequestSchema,
		response: RefreshTokenResponseSchema,
		error: RefreshTokenErrorSchema,
	},
	verifyEmailSchemas: {
		request: VerifyEmailRequestSchema,
		response: VerifyEmailResponseSchema,
		error: VerifyEmailErrorSchema,
	},
	resetPasswordSchemas: {
		request: ResetPasswordRequestSchema,
		response: ResetPasswordResponseSchema,
		error: ResetPasswordErrorSchema,
	},
	resendVerificationEmailSchemas: {
		request: ResendVerificationEmailRequestSchema,
		response: ResendVerificationEmailResponseSchema,
		error: ResendVerificationEmailErrorSchema,
	},
	logoutSchemas: {
		response: LogoutResponseSchema,
		error: LogoutErrorSchema,
	},
	UpdateUserRequestSchema,
	UpdateUserResponseSchema,
	UpdateUserErrorSchema,
	DeleteUserResponseSchema,
	DeleteUserErrorSchema,
	getCurrentUserSchemas: {
		response: GetCurrentUserResponseSchema,
		error: GetCurrentUserErrorSchema,
	},
	listAppsOwnedByUserSchema: z.object({
		userId: z.string().min(1).max(255),
	}),
};

export default responseService;
