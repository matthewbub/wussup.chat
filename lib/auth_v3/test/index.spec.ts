// test/index.spec.ts
import { env, createExecutionContext, waitOnExecutionContext, SELF } from 'cloudflare:test';
import { describe, it, expect } from 'vitest';
import worker from '../src/index';
import { faker } from '@faker-js/faker';
// For now, you'll need to do something like this to get a correctly-typed
// `Request` to pass to `worker.fetch()`.
const IncomingRequest = Request<unknown, IncomingRequestCfProperties>;

describe('Auth Routes', () => {
	describe('POST /sign-up', () => {
		it('should create a new user (integration style)', async () => {
			const pw = faker.internet.password();
			const payload = {
				email: faker.internet.email(),
				password: pw,
				confirmPassword: pw,
			};

			const response = await SELF.fetch('http://localhost:8787/sign-up', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(payload),
			});

			expect(response.status).toBe(200);
			const data = await response.json();
			expect(data).toMatchObject({
				access_token: expect.any(String),
				token_type: 'Bearer',
				expires_in: expect.any(Number),
			});
		});

		it('should reject mismatched passwords', async () => {
			const pw = faker.internet.password();
			const payload = {
				email: faker.internet.email(),
				password: pw,
				confirmPassword: 'password456',
			};

			const response = await SELF.fetch('http://localhost:8787/sign-up', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(payload),
			});

			expect(response.status).toBe(400);
			const data = await response.json();
			expect(data).toHaveProperty('error', 'Passwords do not match');
		});
	});
});
