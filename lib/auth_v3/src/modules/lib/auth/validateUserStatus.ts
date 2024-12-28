import { env } from 'hono/adapter';
import { Context } from 'hono';
import dbService from '../../database';

export const validateUserStatus = async (userId: string, c: Context): Promise<boolean> => {
	const userStatusResult = await dbService.query<{ results: { status: string }[] }>(c, 'SELECT status FROM users WHERE id = ?', [userId]);

	if (!userStatusResult.success || !userStatusResult.data?.results?.[0]) {
		return false;
	}

	const user = userStatusResult.data.results[0];

	return !['deleted', 'suspended'].includes(user.status);
};

export default validateUserStatus;
