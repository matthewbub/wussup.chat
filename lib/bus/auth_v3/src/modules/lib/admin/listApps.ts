import { Context } from 'hono';
import dbService from '../../database';
import { createResponse } from '../../../helpers/createResponse';
import { commonErrorHandler } from '../../../helpers/commonErrorHandler';
import responseService from '../../response';

// defines the expected request body structure
interface ListAppsRequest {
	userId: string;
}

// creates a new app in the database
const listAppsOwnedByUser = async (c: Context, body: ListAppsRequest) => {
	try {
		responseService.listAppsOwnedByUserSchema.parse({ userId: body.userId });

		const result = await dbService.query<{ id: string; name: string; description: string; domain: string; created_at: string }[]>(
			c,
			`SELECT id, name, description, domain, created_at FROM apps WHERE created_by = $1`,
			[body.userId]
		);

		if (!result.success) {
			return createResponse(false, 'Failed to list apps', 'ERR_LIST_APPS_FAILED', null, 500);
		}

		return createResponse(true, 'Apps listed successfully', 'SUCCESS', result.data, 200);
	} catch (error) {
		return commonErrorHandler(error, c);
	}
};

export default listAppsOwnedByUser;
