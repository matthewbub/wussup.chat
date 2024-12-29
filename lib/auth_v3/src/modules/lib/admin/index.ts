import listUsers from './listUsers';
import suspendUser from './suspendUser';
import promoteUser from './promoteUser';
import createApp from './createApp';

const adminService = {
	promoteUser: promoteUser,
	listUsers: listUsers,
	suspendUser: suspendUser,
	createApp: createApp,
};

export default adminService;
