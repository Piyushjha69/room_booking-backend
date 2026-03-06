import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { ValidationError } from '../errors/AppError';

export const validateRequest = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validated = schema.parse(req.body);
      req.body = validated;
      next();
    } catch (error: any) {
      if (error.errors && Array.isArray(error.errors)) {
        const messages = error.errors
          .map((e: any) => e.message)
          .join(', ');
        next(new ValidationError(messages));
        return;
      }
      next(new ValidationError(error.message || 'Validation failed'));
    }
  };
};
