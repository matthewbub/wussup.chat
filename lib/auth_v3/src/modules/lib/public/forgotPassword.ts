import { Context } from 'hono';
import passwordService from '../../password';
import { createResponse } from '../../../helpers/createResponse';
import { commonErrorHandler } from '../../../helpers/commonErrorHandler';
import { codes, errorMessages, httpStatus } from '../../../constants';
import openApiSchemas from '../../../openapi';

export const forgotPassword = async ({ email }: { email: string }, c: Context) => {
	try {
		openApiSchemas.forgotPasswordSchemas.request.parse({ email });
		const result = await passwordService.initiateReset(email, c);
		return createResponse(true, errorMessages.PASSWORD_RESET_INITIATED, codes.PASSWORD_RESET_INITIATED, result, httpStatus.OK);
	} catch (error) {
		return commonErrorHandler(error, c);
	}
};
