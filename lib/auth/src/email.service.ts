import { Context } from 'hono';
import { Resend } from 'resend';

const emailService = {
	/**
	 * sends an email using the resend service
	 * @param {object} params - email parameters
	 * @param {string} params.to - recipient email address
	 * @param {string} params.subject - email subject
	 * @param {string} params.body - email body content
	 * @param {Context} c - hono context containing environment variables
	 * @returns {Promise<object>} response from resend api
	 * @throws {Error} if email sending fails
	 */
	sendEmail: async ({ to, subject, body }: { to: string; subject: string; body: string }, c: Context) => {
		try {
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
};

export default emailService;
