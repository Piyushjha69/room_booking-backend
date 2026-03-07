import { Router } from 'express';
import {
  getAdminStatsController,
  getAllUsersController,
  updateUserRoleController,
} from '../controller/admin.controller';
import { authMiddleware } from '../middleware/authMiddleware';
import { adminMiddleware } from '../middleware/adminMiddleware';

export const adminRouter = Router();

adminRouter.use(authMiddleware);
adminRouter.use(adminMiddleware);

adminRouter.get('/api/admin/stats', getAdminStatsController);
adminRouter.get('/api/admin/users', getAllUsersController);
adminRouter.patch('/api/admin/users/:id/role', updateUserRoleController);
