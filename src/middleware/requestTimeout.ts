import { Request, Response, NextFunction } from 'express';

export const requestTimeout = (ms: number) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const timeout = setTimeout(() => {
      if (!res.headersSent) {
        res.status(503).json({
          success: false,
          statusCode: 503,
          message: 'Request timed out',
          error: 'Service Unavailable',
        });
      }
    }, ms);

    res.on('finish', () => clearTimeout(timeout));
    res.on('close', () => clearTimeout(timeout));

    next();
  };
};
