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
};
