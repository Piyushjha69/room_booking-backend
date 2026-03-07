import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ValidationError } from '../errors/AppError';

export const validateRequest = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validated = schema.parse(req.body);
      req.body = validated;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const issues = error.issues;
        const errorMessages: string[] = [];

        for (const issue of issues) {
          const path = issue.path.join('.');
          const message = issue.message;

          if (path) {
            errorMessages.push(`${path}: ${message}`);
          } else {
            errorMessages.push(message);
          }
        }

        const combinedMessage = errorMessages.join('; ');
        next(new ValidationError(combinedMessage));
        return;
      }

      if (error instanceof Error) {
        next(new ValidationError(error.message || 'Validation failed'));
        return;
      }

      next(new ValidationError('Validation failed'));
    }
  };
};
