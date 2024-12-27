import { env } from 'hono/adapter';
import { Context } from 'hono';

export const validateUserStatus = async (userId: string, c: Context): Promise<boolean> => {
	const db = env(c).DB;

	try {
		const userResult = await db.prepare('SELECT status FROM users WHERE id = ?').bind(userId).run();

		const user = userResult.results?.[0] as { status: string };
		if (!user) return false;

		return !['deleted', 'suspended'].includes(user.status);
	} catch {
		return false;
	}
};

export default validateUserStatus;
