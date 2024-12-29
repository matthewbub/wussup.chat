import { Context } from 'hono';
import dbService from '../../database';
import { createResponse } from '../../../helpers/createResponse';
import { commonErrorHandler } from '../../../helpers/commonErrorHandler';

// defines the expected request body structure
interface CreateAppRequest {
	name: string;
	description?: string;
	domain?: string;
	userId: string;
}

// creates a new app in the database
const createApp = async (c: Context, body: CreateAppRequest) => {
	try {
		if (!body.name) {
			return createResponse(false, 'App name is required', 'ERR_INVALID_INPUT', null, 400);
		}

		if (!body.userId) {
			return createResponse(false, 'User ID is required', 'ERR_INVALID_INPUT', null, 400);
		}

		const result = await dbService.query<{ id: string; name: string; description: string; domain: string; created_at: string }[]>(
			c,
			`INSERT INTO apps (id, name, description, domain, created_by)
			 VALUES ($1, $2, $3, $4, $5)
			 RETURNING id, name, description, domain, created_at`,
			[crypto.randomUUID(), body.name, body.description || null, body.domain || null, body.userId]
		);

		console.log('body/fcreateApp', body);
		console.log('result/fcreateApp', result);

		if (!result.success) {
			return createResponse(false, 'Failed to create app', 'ERR_CREATE_APP_FAILED', null, 500);
		}

		return createResponse(true, 'App created successfully', 'SUCCESS', result.data?.[0], 201);
	} catch (error) {
		return commonErrorHandler(error, c);
	}
};

export default createApp;
