import { Context } from 'hono';
import { env } from 'hono/adapter';
import { Resend } from 'resend';
import dbService from './database';
import validationServices from './validations';
import ReactDOMServer from 'react-dom/server';
import React from 'react';
import { VerifyAccountEmail } from './verify-account';

const VERIFICATION_EXPIRES_IN = 24 * 60 * 60; // 24 hours

const emailService = {
	// sends an email using the resend service
	sendEmail: async ({ to, subject, body }: { to: string; subject: string; body: string }, c: Context) => {
		try {
			if (env(c).ENV === 'test') {
				// mock response in test mode
				return { data: { message: 'Email sent (mocked)' } };
			}

			const resend = new Resend(c.env.RESEND_KEY);
			const from = `${c.env.NO_REPLY_NAME} <${c.env.NO_REPLY_EMAIL}>`;
			const html = `<p>${body}</p>`;
			const text = `${body}`;

			const res = await resend.emails.send({
				from,
				to,
				subject,
				html,
				text,
			});

			if (!res || !res.data) {
				throw new Error('Failed to send email - no response from service');
			}

			return res;
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Unknown error';
			const errorStack = error instanceof Error ? error.stack : '';
			throw new Error(`Failed to send email: ${errorMessage} ${errorStack}`);
		}
	},
	// sends a verification email to a user
	sendVerificationEmail: async ({ to, user, appId }: { to: string; user: any; appId: string | null }, c: Context) => {
		try {
			const verificationToken = crypto.randomUUID();

			// validate app id
			if (appId) {
				const appValidationError = await validationServices.validateAppId(appId, c);
				if (appValidationError) {
					return appValidationError;
				}
			}
			// store verification token in database
			const res = await dbService.transaction(c, [
				{
					sql: `
						INSERT INTO verification_tokens (
							token, 
							user_id, 
							type, 
							expires_at,
							app_id
						) VALUES (?, ?, ?, ?, ?)
					`,
					params: [verificationToken, user.id, 'email', new Date(Date.now() + VERIFICATION_EXPIRES_IN * 1000).toISOString(), appId || null],
				},
			]);

			if (!res.success) {
				throw new Error('Failed to create verification token in database');
			}

			// construct verification url from environment
			const baseUrl = env(c).APP_URL || 'http://localhost:3000';
			const verificationUrl = `${baseUrl}/verify-email?token=${verificationToken}${appId ? `&appId=${appId}` : ''}`;

			// send verification email using the new template
			const emailResult = await emailService.sendEmail(
				{
					to: to,
					subject: 'Verify your email',
					body: ReactDOMServer.renderToStaticMarkup(React.createElement(VerifyAccountEmail, { verificationUrl })),
				},
				c,
			);

			return {
				...emailResult,
				...(env(c).ENV === 'test' && { verificationToken }),
			};
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Unknown error';
			throw new Error(`Failed to send verification email: ${errorMessage}`);
		}
	},
};

export default emailService;
