import { Request, Response, NextFunction } from 'express';
import { ForbiddenError } from '../errors/AppError';

export const adminMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    next(new ForbiddenError('User not authenticated'));
    return;
  }

  if (req.user.role !== 'ADMIN') {
    next(new ForbiddenError('Admin privileges required'));
    return;
  }

  next();
};
