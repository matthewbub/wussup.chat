import { Context } from 'hono';
import { env } from 'hono/adapter';
import jwtService from '../../jwt';
import passwordService from '../../password';
import responseService from '../../response';
import { createResponse } from '../../../helpers/createResponse';
import { commonErrorHandler } from '../../../helpers/commonErrorHandler';

const EXPIRES_IN = 60 * 60; // 1 hour

export const login = async ({ email, password }: { email: string; password: string }, c: Context) => {
	const db = env(c).DB;

	try {
		responseService.loginSchema.parse({ email, password });

		const d1Result: D1Result = await db
			.prepare('SELECT id, password, status, failed_login_attempts, locked_until FROM users WHERE email = ?')
			.bind(email)
			.run();

		if (!d1Result.success) {
			return c.json(createResponse(false, d1Result.error || 'Database error', 'DB_ERROR'), 500);
		}

		const user = d1Result.results?.[0] as {
			id: string;
			password: string;
			status: string;
			failed_login_attempts: number;
			locked_until: string | null;
		};

		if (!user) {
			return c.json(createResponse(false, 'Invalid email or password', 'USER_NOT_FOUND'), 404);
		}

		// check account status
		if (user.status === 'deleted') {
			return c.json(createResponse(false, 'Account has been deleted', 'ACCOUNT_DELETED'), 403);
		}

		if (user.status === 'suspended') {
			return c.json(createResponse(false, 'Account has been suspended. Please contact support.', 'ACCOUNT_SUSPENDED'), 403);
		}

		// check if account is locked
		if (user.locked_until && new Date(user.locked_until) > new Date() && user.status === 'temporarily_locked') {
			return c.json(
				createResponse(false, 'Account is temporarily locked. Please reset your password via email.', 'ACCOUNT_LOCKED', {
					lockedUntil: user.locked_until,
				}),
				403
			);
		}

		const loginAttemptResult = await passwordService.handleLoginAttempt({ user, passwordAttempt: password }, c);
		if (loginAttemptResult instanceof Error || loginAttemptResult.error) {
			return c.json(
				createResponse(
					false,
					loginAttemptResult instanceof Error ? loginAttemptResult.message : loginAttemptResult.error || 'Unknown error',
					'LOGIN_ATTEMPT_FAILED'
				),
				401
			);
		}

		const payload = {
			id: user.id,
			exp: Math.floor(Date.now() / 1000) + EXPIRES_IN,
		};

		const token = await jwtService.assignRefreshToken(c, payload);
		if (token instanceof Error) {
			return c.json(createResponse(false, token.message, 'TOKEN_GENERATION_FAILED'), 500);
		}

		return c.json(
			createResponse(true, 'Login successful', 'SUCCESS', {
				access_token: token,
				token_type: 'Bearer',
				expires_in: EXPIRES_IN,
			})
		);
	} catch (error) {
		return commonErrorHandler(error, c);
	}
};
