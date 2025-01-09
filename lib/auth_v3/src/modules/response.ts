import { z } from 'zod';
import { z as zOpenApi } from '@hono/zod-openapi';

// error messages for password validation
const minLengthErrorMessage = 'Password must be at least 8 characters';
const maxLengthErrorMessage = 'Password must not exceed 20 characters';
const uppercaseErrorMessage = 'Password must contain at least one uppercase letter';
const lowercaseErrorMessage = 'Password must contain at least one lowercase letter';
const numberErrorMessage = 'Password must contain at least one number';
const specialCharacterErrorMessage = 'Password must contain at least one special character (!@#$%^&*)';

export const appIdSchema = zOpenApi.string().min(1).max(255).openapi({
	example: 'app_123',
	description: 'App ID',
});

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
		success: zOpenApi.boolean().openapi({
			example: true,
			description: 'Whether the request was successful',
		}),
		message: zOpenApi.string().openapi({
			example: 'Signup successful',
			description: 'Message describing the result of the signup request',
		}),
		code: zOpenApi.string().openapi({
			example: '200',
			description: 'HTTP status code',
		}),
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
		success: zOpenApi.boolean().openapi({
			example: false,
			description: 'Whether the request was successful',
		}),
		message: zOpenApi.string().openapi({
			example: 'Signup failed',
			description: 'Message describing the result of the signup request',
		}),
		code: zOpenApi.string().openapi({
			example: '400',
			description: 'HTTP status code',
		}),
		data: zOpenApi
			.object({
				errors: zOpenApi.array(
					zOpenApi.object({
						message: zOpenApi.string().openapi({
							example: 'Invalid email format',
							description: 'Error message',
						}),
						path: zOpenApi.array(zOpenApi.string()).openapi({
							example: ['email'],
							description: 'Path to the field that caused the error',
						}),
						code: zOpenApi.string().openapi({
							example: 'invalid_email',
							description: 'Error code',
						}),
						validation: zOpenApi.string().optional().openapi({
							example: 'email must be a valid email address',
							description: 'Validation message',
						}),
						type: zOpenApi.string().optional().openapi({
							example: 'string',
							description: 'Type of the field that caused the error',
						}),
						exact: zOpenApi.boolean().optional().openapi({
							example: false,
							description: 'Whether the error is exact',
						}),
						inclusive: zOpenApi.boolean().optional().openapi({
							example: false,
							description: 'Whether the error is inclusive',
						}),
						minimum: zOpenApi.number().optional().openapi({
							example: 8,
							description: 'Minimum length of the field that caused the error',
						}),
					})
				),
			})
			.optional()
			.openapi({
				description: 'Errors returned by the server',
			}),
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
		success: zOpenApi.boolean().openapi({
			example: true,
			description: 'Whether the request was successful',
		}),
		message: zOpenApi.string().openapi({
			example: 'Refresh successful',
			description: 'Message describing the result of the refresh request',
		}),
		code: zOpenApi.string().openapi({
			example: '200',
			description: 'HTTP status code',
		}),
		data: zOpenApi
			.object({
				access_token: zOpenApi.string().openapi({
					example: 'eyJhbGciOiJIUzI1NiIs...',
					description: 'Access token',
				}),
				token_type: zOpenApi.literal('Bearer').openapi({
					example: 'Bearer',
					description: 'Token type',
				}),
				expires_in: zOpenApi.number().openapi({
					example: 3600,
					description: 'Token expiration time in seconds',
				}),
			})
			.optional()
			.openapi({
				description: 'Data returned by the server',
			}),
	})
	.openapi('RefreshTokenResponse');

const RefreshTokenErrorSchema = zOpenApi
	.object({
		success: zOpenApi.boolean().openapi({
			example: false,
			description: 'Whether the request was successful',
		}),
		message: zOpenApi.string().openapi({
			example: 'Refresh failed',
			description: 'Message describing the result of the refresh request',
		}),
		code: zOpenApi.string().openapi({
			example: '400',
			description: 'HTTP status code',
		}),
		data: zOpenApi.null().openapi({
			description: 'Data returned by the server',
		}),
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
		success: zOpenApi.boolean().openapi({
			example: true,
			description: 'Whether the request was successful',
		}),
		message: zOpenApi.string().openapi({
			example: 'Email verified successfully',
			description: 'Message describing the result of the email verification request',
		}),
		code: zOpenApi.string().openapi({
			example: '200',
			description: 'HTTP status code',
		}),
		data: zOpenApi.null().openapi({
			description: 'Data returned by the server',
		}),
	})
	.openapi('VerifyEmailResponse');

const VerifyEmailErrorSchema = zOpenApi
	.object({
		success: zOpenApi.boolean().openapi({
			example: false,
			description: 'Whether the request was successful',
		}),
		message: zOpenApi.string().openapi({
			example: 'Email verification failed',
			description: 'Message describing the result of the email verification request',
		}),
		code: zOpenApi.string().openapi({
			example: '400',
			description: 'HTTP status code',
		}),
		data: zOpenApi.null().openapi({
			description: 'Data returned by the server',
		}),
	})
	.openapi('VerifyEmailError');

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
		success: zOpenApi.boolean().openapi({
			example: true,
			description: 'Whether the request was successful',
		}),
		message: zOpenApi.string().openapi({
			example: 'Password reset successful',
			description: 'Message describing the result of the password reset request',
		}),
		code: zOpenApi.string().openapi({
			example: '200',
			description: 'HTTP status code',
		}),
		data: zOpenApi.null().openapi({
			description: 'Data returned by the server',
		}),
	})
	.openapi('ResetPasswordResponse');

const ResetPasswordErrorSchema = zOpenApi
	.object({
		success: zOpenApi.boolean().openapi({
			example: false,
			description: 'Whether the request was successful',
		}),
		message: zOpenApi.string().openapi({
			example: 'Password reset failed',
			description: 'Message describing the result of the password reset request',
		}),
		code: zOpenApi.string().openapi({
			example: '400',
			description: 'HTTP status code',
		}),
		data: zOpenApi.null().openapi({
			description: 'Data returned by the server',
		}),
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
		success: zOpenApi.boolean().openapi({
			example: true,
			description: 'Whether the request was successful',
		}),
		message: zOpenApi.string().openapi({
			example: 'Verification email resent successfully',
			description: 'Message describing the result of the resend verification email request',
		}),
		code: zOpenApi.string().openapi({
			example: '200',
			description: 'HTTP status code',
		}),
		data: zOpenApi.null().openapi({
			description: 'Data returned by the server',
		}),
	})
	.openapi('ResendVerificationEmailResponse');

const ResendVerificationEmailErrorSchema = zOpenApi
	.object({
		success: zOpenApi.boolean().openapi({
			example: false,
			description: 'Whether the request was successful',
		}),
		message: zOpenApi.string().openapi({
			example: 'Verification email resend failed',
			description: 'Message describing the result of the resend verification email request',
		}),
		code: zOpenApi.string().openapi({
			example: '400',
			description: 'HTTP status code',
		}),
		data: zOpenApi.null().openapi({
			description: 'Data returned by the server',
		}),
	})
	.openapi('ResendVerificationEmailError');

const LogoutResponseSchema = zOpenApi
	.object({
		success: zOpenApi.boolean().openapi({
			example: true,
			description: 'Whether the request was successful',
		}),
		message: zOpenApi.string().openapi({
			example: 'Logout successful',
			description: 'Message describing the result of the logout request',
		}),
		code: zOpenApi.string().openapi({
			example: '200',
			description: 'HTTP status code',
		}),
		data: zOpenApi.null().openapi({
			description: 'Data returned by the server',
		}),
	})
	.openapi('LogoutResponse');

const LogoutErrorSchema = zOpenApi
	.object({
		success: zOpenApi.boolean().openapi({
			example: false,
			description: 'Whether the request was successful',
		}),
		message: zOpenApi.string().openapi({
			example: 'Logout failed',
			description: 'Message describing the result of the logout request',
		}),
		code: zOpenApi.string().openapi({
			example: '400',
			description: 'HTTP status code',
		}),
		data: zOpenApi.null().openapi({
			description: 'Data returned by the server',
		}),
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
		success: zOpenApi.boolean().openapi({
			example: true,
			description: 'Whether the request was successful',
		}),
		message: zOpenApi.string().openapi({
			example: 'User updated successfully',
			description: 'Message describing the result of the update user request',
		}),
		code: zOpenApi.string().openapi({
			example: '200',
			description: 'HTTP status code',
		}),
		data: zOpenApi
			.object({
				user: zOpenApi.object({
					email: zOpenApi.string().optional().openapi({
						example: 'user@example.com',
						description: "User's email address",
					}),
					username: zOpenApi.string().optional().openapi({
						example: 'username',
						description: 'User username',
					}),
				}),
			})
			.optional()
			.openapi({
				description: 'Data returned by the server',
			}),
	})
	.openapi('UpdateUserResponse');

const UpdateUserErrorSchema = zOpenApi
	.object({
		success: zOpenApi.boolean().openapi({
			example: false,
			description: 'Whether the request was successful',
		}),
		message: zOpenApi.string().openapi({
			example: 'User update failed',
			description: 'Message describing the result of the update user request',
		}),
		code: zOpenApi.string().openapi({
			example: '400',
			description: 'HTTP status code',
		}),
		data: zOpenApi.null().openapi({
			description: 'Data returned by the server',
		}),
	})
	.openapi('UpdateUserError');

const DeleteUserResponseSchema = zOpenApi
	.object({
		success: zOpenApi.boolean().openapi({
			example: true,
			description: 'Whether the request was successful',
		}),
		message: zOpenApi.string().openapi({
			example: 'User deleted successfully',
			description: 'Message describing the result of the delete user request',
		}),
		code: zOpenApi.string().openapi({
			example: '200',
			description: 'HTTP status code',
		}),
		data: zOpenApi.null().openapi({
			description: 'Data returned by the server',
		}),
	})
	.openapi('DeleteUserResponse');

const DeleteUserErrorSchema = zOpenApi
	.object({
		success: zOpenApi.boolean().openapi({
			example: false,
			description: 'Whether the request was successful',
		}),
		message: zOpenApi.string().openapi({
			example: 'User deletion failed',
			description: 'Message describing the result of the delete user request',
		}),
		code: zOpenApi.string().openapi({
			example: '400',
			description: 'HTTP status code',
		}),
		data: zOpenApi.null().openapi({
			description: 'Data returned by the server',
		}),
	})
	.openapi('DeleteUserError');

const GetCurrentUserResponseSchema = zOpenApi
	.object({
		success: zOpenApi.boolean().openapi({
			example: true,
			description: 'Whether the request was successful',
		}),
		message: zOpenApi.string().openapi({
			example: 'User fetched successfully',
			description: 'Message describing the result of the get current user request',
		}),
		code: zOpenApi.string().openapi({
			example: '200',
			description: 'HTTP status code',
		}),
		data: zOpenApi.object({
			id: zOpenApi.string().openapi({
				example: '123',
				description: 'User ID',
			}),
			email: zOpenApi.string().openapi({
				example: 'user@example.com',
				description: "User's email address",
			}),
			username: zOpenApi.string().openapi({
				example: 'username',
				description: 'User username',
			}),
			status: zOpenApi.string().openapi({
				example: 'active',
				description: 'User status',
			}),
			role: zOpenApi.string().openapi({
				example: 'admin',
				description: 'User role',
			}),
			email_verified: zOpenApi.number().openapi({
				example: 1,
				description: 'Whether the user email is verified',
			}),
			last_login_at: zOpenApi.string().nullable().openapi({
				example: '2024-01-01T00:00:00Z',
				description: 'Last login date',
			}),
			created_at: zOpenApi.string().openapi({
				example: '2024-01-01T00:00:00Z',
				description: 'User creation date',
			}),
		}),
	})
	.openapi('GetCurrentUserResponse');

const GetCurrentUserErrorSchema = zOpenApi
	.object({
		success: zOpenApi.boolean().openapi({
			example: false,
			description: 'Whether the request was successful',
		}),
		message: zOpenApi.string().openapi({
			example: 'User fetch failed',
			description: 'Message describing the result of the get current user request',
		}),
		code: zOpenApi.string().openapi({
			example: '400',
			description: 'HTTP status code',
		}),
		data: zOpenApi.null().openapi({
			description: 'Data returned by the server',
		}),
	})
	.openapi('GetCurrentUserError');

const responseService = {
	signUpSchema: z
		.object({
			email: zOpenApi.string().email().max(255).openapi({
				example: 'user@example.com',
				description: "User's email address",
			}),
			password: passwordSchema,
			confirmPassword: passwordSchema,
		})
		.refine((data) => data.password === data.confirmPassword, {
			message: "Passwords don't match",
			path: ['confirmPassword'],
		}),
	loginSchema: z.object({
		email: zOpenApi.string().email().max(255).openapi({
			example: 'user@example.com',
			description: "User's email address",
		}),
		password: passwordSchema,
	}),
	// loginSchemas: {
	// 	request: LoginRequestSchema,
	// 	response: LoginResponseSchema,
	// 	error: LoginErrorSchema,
	// },
	refreshSchema: z.object({
		refreshToken: zOpenApi.string().min(1).max(255).openapi({
			example: 'eyJhbGciOiJIUzI1NiIs...',
			description: 'Refresh token received from login or previous refresh',
		}),
	}),
	verifyEmailSchema: z.object({
		token: zOpenApi.string().min(1).max(255).openapi({
			example: 'verification_token_123',
			description: 'Email verification token',
		}),
	}),
	forgotPasswordSchema: z.object({
		email: zOpenApi.string().email().max(255).openapi({
			example: 'user@example.com',
			description: "User's email address",
		}),
	}),
	// forgotPasswordSchemas: {
	// 	request: ForgotPasswordRequestSchema,
	// 	response: ForgotPasswordResponseSchema,
	// 	error: ForgotPasswordErrorSchema,
	// },
	resendForgotPasswordSchema: z.object({
		email: zOpenApi.string().email().max(255).openapi({
			example: 'user@example.com',
			description: "User's email address",
		}),
	}),
	resendVerificationEmailSchema: z.object({
		email: zOpenApi.string().email().max(255).openapi({
			example: 'user@example.com',
			description: "User's email address",
		}),
	}),
	resetPasswordSchema: z
		.object({
			token: zOpenApi.string().min(1).max(255).openapi({
				example: 'reset_token_123',
				description: 'Password reset token',
			}),
			password: passwordSchema,
			confirmPassword: passwordSchema,
		})
		.refine((data) => data.password === data.confirmPassword, {
			message: "Passwords don't match",
			path: ['confirmPassword'],
		}),
	updateUserSchema: z
		.object({
			email: zOpenApi.string().email().max(255).optional().openapi({
				example: 'user@example.com',
				description: "User's email address",
			}),
			username: zOpenApi.string().min(3).max(255).optional().openapi({
				example: 'username',
				description: 'User username',
			}),
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
		userId: zOpenApi.string().min(1).max(255).openapi({
			example: '123',
			description: 'User ID',
		}),
	}),
};

export default responseService;
