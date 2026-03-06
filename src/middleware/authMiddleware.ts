import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, extractTokenFromHeader } from '../utils/jwt.utils';
import { AuthenticationError } from '../errors/AppError';

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      throw new AuthenticationError('No token provided');
    }

    const payload = verifyAccessToken(token);
    if (!payload) {
      throw new AuthenticationError('Invalid or expired token');
    }

    req.user = {
      id: payload.userId,
      email: payload.email,
    };

    next();
  } catch (error) {
    throw new AuthenticationError(
      error instanceof Error ? error.message : 'Authentication failed'
    );
  }
};
