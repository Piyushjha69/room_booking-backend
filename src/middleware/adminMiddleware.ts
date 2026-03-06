import { Request, Response, NextFunction } from 'express';
import { ForbiddenError } from '../errors/AppError';

export const adminMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    throw new ForbiddenError('User not authenticated');
  }

  if (req.user.role !== 'ADMIN') {
    throw new ForbiddenError('Admin privileges required');
  }

  next();
};
