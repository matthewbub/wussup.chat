import logout from './logout';
import changePassword from './changePassword';
import getCurrentUser from './getCurrentUser';
import updateUser from './updateUser';
import deleteAccount from './deleteAccount';
import validateUserStatus from './validateUserStatus';

const authService = {
	logout: logout,
	changePassword: changePassword,
	getCurrentUser: getCurrentUser,
	updateUser: updateUser,
	deleteAccount: deleteAccount,
	validateUserStatus: validateUserStatus,
};

export default authService;
