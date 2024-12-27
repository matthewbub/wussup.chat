import listUsers from './listUsers';
import suspendUser from './suspendUser';
import promoteUser from './promoteUser';

const adminService = {
	promoteUser: promoteUser,
	listUsers: listUsers,
	suspendUser: suspendUser,
};

export default adminService;
