export const USER_STATUSES = {
	ACTIVE: 'active',
	PENDING: 'pending',
	SUSPENDED: 'suspended',
	DELETED: 'deleted',
	TEMPORARILY_LOCKED: 'temporarily_locked',
};

export const HTTP_STATUS = {
	OK: 200,
	CONFLICT: 409,
	INTERNAL_SERVER_ERROR: 500,
	UNAUTHORIZED: 401,
	NOT_FOUND: 404,
} as const;

export const TEST_ENV = 'test';
export const BEARER = 'Bearer';
export const EXPIRES_IN = 60 * 60; // 1 hour

export const ERROR_MESSAGES = {
	INVALID_EMAIL_FORMAT: 'Invalid email format',
	WEAK_PASSWORD: 'Password must be at least 8 characters long',
	PASSWORDS_DO_NOT_MATCH: 'Passwords do not match',
	EMAIL_ALREADY_IN_USE: 'Email already in use',
	USER_CREATION_FAILED: 'Failed to create user',
	PASSWORD_HISTORY_ERROR: 'Error adding password to history',
	EMAIL_SEND_ERROR: 'Failed to send verification email',
	TOKEN_GENERATION_ERROR: 'Error generating token',
	UNEXPECTED_ERROR: 'Unknown error',
	SUCCESS: 'User created successfully',
	INVALID_VERIFICATION_TOKEN: 'Invalid verification token',
	TOKEN_EXPIRED_OR_USED: 'Token expired or already used',
	EMAIL_VERIFICATION_FAILED: 'Failed to verify email',
	EMAIL_VERIFIED_SUCCESS: 'Email verified successfully',
	DATABASE_ERROR: 'Database error while looking up user',
	VERIFICATION_EMAIL_SENT: 'If a matching account was found, a verification email has been sent.',
	EMAIL_ALREADY_VERIFIED: 'Email is already verified',
	UNABLE_TO_RESEND: 'Unable to resend verification email',
	RATE_LIMIT_MESSAGE: 'Please wait 5 minutes before requesting another verification email',
	EMAIL_SEND_FAILED: 'Failed to send verification email',
	VERIFICATION_EMAIL_SUCCESS: 'Verification email has been resent',
};

export const RESPONSE_CODES = {
	INVALID_EMAIL_FORMAT: 'INVALID_EMAIL_FORMAT',
	WEAK_PASSWORD: 'WEAK_PASSWORD',
	PASSWORDS_DO_NOT_MATCH: 'PASSWORDS_DO_NOT_MATCH',
	EMAIL_ALREADY_IN_USE: 'EMAIL_ALREADY_IN_USE',
	USER_CREATION_FAILED: 'USER_CREATION_FAILED',
	PASSWORD_HISTORY_ERROR: 'PASSWORD_HISTORY_ERROR',
	EMAIL_SEND_ERROR: 'EMAIL_SEND_ERROR',
	TOKEN_GENERATION_ERROR: 'TOKEN_GENERATION_ERROR',
	UNEXPECTED_ERROR: 'UNEXPECTED_ERROR',
	SUCCESS: 'SUCCESS',
	INVALID_VERIFICATION_TOKEN: 'INVALID_VERIFICATION_TOKEN',
	TOKEN_INVALID: 'TOKEN_INVALID',
	EMAIL_VERIFICATION_FAILED: 'EMAIL_VERIFICATION_FAILED',
	DB_ERROR: 'DB_ERROR',
	USER_NOT_FOUND: 'USER_NOT_FOUND',
	EMAIL_ALREADY_VERIFIED: 'EMAIL_ALREADY_VERIFIED',
	UNABLE_TO_RESEND: 'UNABLE_TO_RESEND',
	RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
	EMAIL_SEND_FAILED: 'EMAIL_SEND_FAILED',
};

export const TIMING = {
	VERIFICATION_EMAIL_COOLDOWN: 5 * 60 * 1000, // 5 minutes in milliseconds
} as const;
