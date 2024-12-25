import { Context } from 'hono';
import { env } from 'hono/adapter';
import { Resend } from 'resend';

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
	sendVerificationEmail: async ({ to, user }: { to: string; user: any }, c: Context) => {
		try {
			const db = env(c).DB;
			const verificationToken = crypto.randomUUID();

			// store verification token in database
			const verificationResult = await db
				.prepare(
					`
						INSERT INTO verification_tokens (
							token, 
							user_id, 
							type, 
							expires_at
						) VALUES (?, ?, ?, ?)
					`
				)
				.bind(verificationToken, user.id, 'email', new Date(Date.now() + VERIFICATION_EXPIRES_IN * 1000).toISOString())
				.run();

			if (!verificationResult.success) {
				throw new Error('Failed to create verification token in database');
			}

			// construct verification url from environment
			const baseUrl = env(c).VERIFICATION_URL || 'http://localhost:3000';
			const verificationUrl = `${baseUrl}/verify-email/${verificationToken}`;

			// send verification email
			const emailResult = await emailService.sendEmail(
				{
					to: to,
					subject: 'Verify your email',
					body: `Please verify your email by clicking this link: ${verificationUrl}\n\nThis link will expire in 24 hours.`,
				},
				c
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
