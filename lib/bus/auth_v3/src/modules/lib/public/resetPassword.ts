import { Context } from 'hono';
import passwordService from '../../password';
import responseService from '../../response';
import { commonErrorHandler } from '../../../helpers/commonErrorHandler';

export const resetPassword = async (
	{ token, password, confirmPassword }: { token: string; password: string; confirmPassword: string },
	c: Context
) => {
	try {
		const appId = c.req.header('x-app-id');

		responseService.resetPasswordSchema.parse({ token, password, confirmPassword });
		return await passwordService.completeReset({ token, newPassword: password, appId }, c);
	} catch (error) {
		return commonErrorHandler(error, c);
	}
};
