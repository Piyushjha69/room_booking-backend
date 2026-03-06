import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.services';
import { sendError, sendSuccess } from '../utils/apiResponse';
import { ValidationError } from '../errors/AppError';

export const registerController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authService = new AuthService(req.db!);
    const result = await authService.register(req.body);

    sendSuccess(res, 201, 'Registration successful', {
      accessToken: result.tokens.accessToken,
      refreshToken: result.tokens.refreshToken,
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const loginController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authService = new AuthService(req.db!);
    const result = await authService.login(req.body);

    sendSuccess(res, 200, 'Login successful', {
      accessToken: result.tokens.accessToken,
      refreshToken: result.tokens.refreshToken,
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const refreshTokenController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new ValidationError('Refresh token is required');
    }

    const authService = new AuthService(req.db!);
    const tokens = await authService.refreshAccessToken(refreshToken);

    sendSuccess(res, 200, 'Token refreshed successfully', tokens);
  } catch (error) {
    next(error);
  }
};
