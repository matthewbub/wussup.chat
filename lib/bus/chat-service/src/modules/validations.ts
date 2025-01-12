import { Context } from 'hono';
import dbService from './database';
import { createResponse } from '../helpers/createResponse';
import { httpStatus } from '../constants';

const validationServices = {
	validateAppId: async (appId: string, c: Context) => {
		const appResult = await dbService.query<{ results: { id: string }[] }>(c, 'SELECT id FROM apps WHERE id = ?', [appId]);

		if (!appResult.success || !appResult.data?.results?.length) {
			return createResponse(false, 'Invalid app ID', 'INVALID_APP_ID', null, httpStatus.BAD_REQUEST);
		}

		return null;
	},
};

export default validationServices;
