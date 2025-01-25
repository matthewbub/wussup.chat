import listUsers from './listUsers';
import suspendUser from './suspendUser';
import promoteUser from './promoteUser';
import createApp from './createApp';
import listAppsOwnedByUser from './listApps';
const adminService = {
	promoteUser: promoteUser,
	listUsers: listUsers,
	suspendUser: suspendUser,
	createApp: createApp,
	listAppsOwnedByUser: listAppsOwnedByUser,
};

export default adminService;
