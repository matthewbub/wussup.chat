import { Context } from 'hono';
import { userStatuses } from '../../../constants';
import dbService from '../../database';

/**
 * validates if a user's status is active
 * @param userId - the user's id
 * @param c - hono context
 * @returns boolean indicating if user status is valid
 */
export const validateUserStatus = async (userId: string, c: Context): Promise<boolean> => {
	const userStatusResult = await dbService.query<{ results: { status: string }[] }>(c, 'SELECT status FROM users WHERE id = ?', [userId]);

	if (!userStatusResult.success || !userStatusResult.data?.results?.[0]) {
		return false;
	}

	const user = userStatusResult.data.results[0];
	const invalidStatuses = [userStatuses.DELETED, userStatuses.SUSPENDED];

	return !invalidStatuses.includes(user.status);
};

export default validateUserStatus;
