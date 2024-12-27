import { Context } from 'hono';
import passwordService from '../../password';
import responseService from '../../response';
import { createResponse } from '../../../helpers/createResponse';
import { commonErrorHandler } from '../../../helpers/commonErrorHandler';

export const forgotPassword = async ({ email }: { email: string }, c: Context) => {
	try {
		responseService.forgotPasswordSchema.parse({ email });
		const result = await passwordService.initiateReset(email, c);
		return c.json(createResponse(true, 'If a user exists with this email, they will receive reset instructions.', 'SUCCESS', result));
	} catch (error) {
		return commonErrorHandler(error, c);
	}
};
