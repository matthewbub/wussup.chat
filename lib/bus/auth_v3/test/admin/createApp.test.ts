import { describe, it, expect, beforeAll } from 'vitest';
import constants from '../constants';
import { getRegularUser } from '../getRegularUser.js';
import { createAdminUser } from '../getAdminUser.js';
import { faker } from '@faker-js/faker';
const API_URL = constants.API_URL;

describe('Admin - Create App', () => {
	it('should create a new app when authenticated as admin', async () => {
		const { accessToken: adminAccessToken, userData: adminUserData } = await createAdminUser();

		const appData = {
			name: faker.company.name(),
			description: faker.lorem.sentence(),
			domain: faker.internet.domainName(),
			userId: adminUserData.id,
		};

		const response = await fetch(`${API_URL}/v3/admin/create-app`, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${adminAccessToken}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(appData),
		});

		const data = await response.json();

		expect(response.status).toBe(201);
		expect(data.success).toBe(true);
		expect(data.code).toBe('SUCCESS');
	});

	it('should create an app with minimal required fields', async () => {
		const { accessToken: adminAccessToken, userData: adminUserData } = await createAdminUser();

		const appData = {
			name: faker.company.name(),
			userId: adminUserData.id,
		};

		const response = await fetch(`${API_URL}/v3/admin/create-app`, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${adminAccessToken}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(appData),
		});

		const data = await response.json();

		expect(response.status).toBe(201);
		expect(data.success).toBe(true);
		expect(data.code).toBe('SUCCESS');
	});

	it('should not allow regular users to create apps', async () => {
		const { accessToken: regularUserToken, userData: regularUserData } = await getRegularUser();

		const appData = {
			name: faker.company.name(),
			description: faker.lorem.sentence(),
			userId: regularUserData.id,
		};

		const response = await fetch(`${API_URL}/v3/admin/create-app`, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${regularUserToken}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(appData),
		});

		const data = await response.json();

		expect(response.status).toBe(403);
		expect(data.success).toBe(false);
		expect(data.message).toBe('Unauthorized');
	});

	it('should require app name', async () => {
		const { accessToken: adminAccessToken, userData: adminUserData } = await createAdminUser();

		const appData = {
			description: faker.lorem.sentence(),
			domain: faker.internet.domainName(),
			userId: adminUserData.id,
		};

		const response = await fetch(`${API_URL}/v3/admin/create-app`, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${adminAccessToken}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(appData),
		});

		const data = await response.json();

		expect(response.status).toBe(400);
		expect(data.success).toBe(false);
		expect(data.code).toBe('ERR_INVALID_INPUT');
	});
});
