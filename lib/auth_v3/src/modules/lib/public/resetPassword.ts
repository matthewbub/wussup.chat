import { Context } from 'hono';
import passwordService from '../../password';
import responseService from '../../response';
import { commonErrorHandler } from '../../../helpers/commonErrorHandler';

export const resetPassword = async (
	{ token, password, confirmPassword }: { token: string; password: string; confirmPassword: string },
	c: Context
) => {
	try {
		responseService.resetPasswordSchema.parse({ token, password, confirmPassword });
		const result = await passwordService.completeReset({ token, newPassword: password }, c);
		return c.json(result);
	} catch (error) {
		return commonErrorHandler(error, c);
	}
};
