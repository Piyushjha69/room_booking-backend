import { Router, Request, Response } from 'express';

export const healthRouter = Router();

healthRouter.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    statusCode: 200,
    message: 'Service is healthy',
  });
});
