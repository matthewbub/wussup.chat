import { Context } from 'hono';
import passwordService from '../../password';
import responseService from '../../response';
import { createResponse } from '../../../helpers/createResponse';
import { commonErrorHandler } from '../../../helpers/commonErrorHandler';
import { codes, errorMessages, httpStatus } from '../../../constants';

export const forgotPassword = async ({ email }: { email: string }, c: Context) => {
	try {
		responseService.forgotPasswordSchema.parse({ email });
		const result = await passwordService.initiateReset(email, c);
		return createResponse(true, errorMessages.PASSWORD_RESET_INITIATED, codes.PASSWORD_RESET_INITIATED, result, httpStatus.OK);
	} catch (error) {
		return commonErrorHandler(error, c);
	}
};
