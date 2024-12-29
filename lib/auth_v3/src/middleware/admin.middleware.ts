import { Context } from 'hono';
import jwtService from '../modules/jwt';
import { env } from 'hono/adapter';

const adminAuthMiddleware = async (c: Context, next: () => Promise<void>) => {
	const token = c.req.header('Authorization')?.split(' ')[1];
	if (!token) {
		return c.json({ success: false, message: 'No token provided' }, 401);
	}

	const payload = await jwtService.decodeToken(token, c);
	if (!payload?.id) {
		return c.json({ success: false, message: 'Invalid token' }, 401);
	}

	const db = env(c).DB;
	const userResult = await db.prepare('SELECT role FROM users WHERE id = ?').bind(payload.id).run();

	const user = userResult.results?.[0] as { role: string };
	if (!user || user.role !== 'admin') {
		return c.json({ success: false, message: 'Unauthorized' }, 403);
	}

	await next();
};

export default adminAuthMiddleware;
