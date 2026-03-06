import { Router } from 'express';
import {
  registerController,
  loginController,
  refreshTokenController,
  logoutController,
} from '../controller/auth.controller';
import { validateRequest } from '../middleware/validationMiddleware';
import { RegisterSchema, LoginSchema } from '../schemas/auth.schema';
import { authMiddleware } from '../middleware/authMiddleware';

export const authRouter = Router();

authRouter.post(
  '/api/auth/register',
  validateRequest(RegisterSchema),
  registerController
);
authRouter.post(
  '/api/auth/login',
  validateRequest(LoginSchema),
  loginController
);
authRouter.post('/api/auth/refresh', refreshTokenController);
authRouter.post('/api/auth/logout', authMiddleware, logoutController);
