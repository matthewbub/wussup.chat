import { describe, it, expect, beforeAll } from 'vitest';
import { createFakeUser } from '../helpers';
import constants from '../constants';
import { getRegularUser } from '../getRegularUser';

const API_URL = constants.API_URL;

describe('Auth Endpoints - /v3/auth/me', () => {
	let token: string;
	let fakeUser: { email: string; username: string };

	beforeAll(async () => {
		const regularUser = await getRegularUser();

		// Store the access token for further tests
		token = regularUser.accessToken;
		fakeUser = {
			email: regularUser.userData.email,
			username: regularUser.userData.username,
		};
	});

	it('should retrieve the current user', async () => {
		await new Promise((resolve) => setTimeout(resolve, 1000));

		const response = await fetch(`${API_URL}/v3/auth/me`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
				'x-app-id': constants.APP_ID,
			},
		});

		const data = await response.json();

		expect(response.status).toBe(200);
		expect(data).toMatchObject({
			success: true,
			message: 'User retrieved successfully',
			data: {
				email: fakeUser.email,
				username: fakeUser.email,
				status: 'active',
				id: expect.any(String),
				created_at: expect.any(String),
				email_verified: 1,
				last_login_at: expect.any(String),
				role: 'user',
			},
		});
	});

	it('should fail to retrieve user without a token', async () => {
		await new Promise((resolve) => setTimeout(resolve, 1000));

		const response = await fetch(`${API_URL}/v3/auth/me`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'x-app-id': constants.APP_ID,
			},
		});

		const responseText = await response.text();

		expect(response.status).toBe(401);
		expect(responseText).toContain('Unauthorized');
	});

	it('should update the current user with a unique username', async () => {
		// Generate a unique username
		const uniqueUsername = `newUsername_${Date.now()}`;

		await new Promise((resolve) => setTimeout(resolve, 1000));

		const response = await fetch(`${API_URL}/v3/auth/me`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
				'x-app-id': constants.APP_ID,
			},
			body: JSON.stringify({
				username: uniqueUsername,
			}),
		});

		const data = await response.json();

		expect(response.status).toBe(201);
		expect(data).toMatchObject({
			success: true,
			message: 'Profile updated successfully',
			code: 'SUCCESS',
			data: {
				user: {
					email: fakeUser.email,
					username: uniqueUsername,
				},
			},
		});
	});

	it('should fail to update user with existing email', async () => {
		const existingEmail = 'existing@example.com';

		// Ensure the existing email is in the database
		await fetch(`${API_URL}/v3/public/sign-up`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'x-app-id': constants.APP_ID,
			},
			body: JSON.stringify({
				email: existingEmail,
				password: 'AnotherPassword123!',
				confirmPassword: 'AnotherPassword123!',
			}),
		});

		await new Promise((resolve) => setTimeout(resolve, 1000));

		const response = await fetch(`${API_URL}/v3/auth/me`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
				'x-app-id': constants.APP_ID,
			},
			body: JSON.stringify({
				email: existingEmail,
			}),
		});

		const data = await response.json();
		expect(response.status).toBe(400);
		expect(data).toMatchObject({
			success: false,
			message: 'Email already registered',
			code: 'ERR_EMAIL_REGISTERED',
			data: null,
		});
	});

	it('should delete the current user account', async () => {
		await new Promise((resolve) => setTimeout(resolve, 1000));

		const response = await fetch(`${API_URL}/v3/auth/me`, {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
				'x-app-id': constants.APP_ID,
			},
		});

		const data = await response.json();

		expect(response.status).toBe(200);
		expect(data).toMatchObject({
			success: true,
			message: 'Account has been deleted',
		});
	});

	it('should fail to delete account without a token', async () => {
		await new Promise((resolve) => setTimeout(resolve, 1000));

		const response = await fetch(`${API_URL}/v3/auth/me`, {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json',
				'x-app-id': constants.APP_ID,
			},
		});

		const responseText = await response.text();

		expect(response.status).toBe(401);
		expect(responseText).toContain('Unauthorized');
	});

	it('should fail to retrieve user with an invalid token', async () => {
		await new Promise((resolve) => setTimeout(resolve, 1000));

		const response = await fetch(`${API_URL}/v3/auth/me`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				Authorization: 'Bearer invalidtoken',
				'x-app-id': constants.APP_ID,
			},
		});

		const responseText = await response.text();

		expect(response.status).toBe(401);
		expect(responseText).toContain('Unauthorized');
	});
});
