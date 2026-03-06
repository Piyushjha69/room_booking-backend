import { Router } from 'express';
import {
  registerController,
  loginController,
  refreshTokenController,
} from '../controller/auth.controller';
import { validateRequest } from '../middleware/validationMiddleware';
import { RegisterSchema, LoginSchema } from '../schemas/auth.schema';

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
