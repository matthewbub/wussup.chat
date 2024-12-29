import { signUp } from './signUp';
import { login } from './login';
import { refreshToken } from './refreshToken';
import { verifyEmail } from './verifyEmail';
import { forgotPassword } from './forgotPassword';
import { resetPassword } from './resetPassword';
import { resendVerificationEmail } from './resendVerificationEmail';
import { publicRoutesService } from './routes';

const publicService = {
	signUp: signUp,
	login: login,
	refreshToken: refreshToken,
	verifyEmail: verifyEmail,
	forgotPassword: forgotPassword,
	resetPassword: resetPassword,
	resendVerificationEmail: resendVerificationEmail,
	routes: publicRoutesService,
};

export default publicService;
