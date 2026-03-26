import { Router, Request, Response } from 'express';

export const healthRouter = Router();

healthRouter.get('/api/health', async (req: Request, res: Response) => {
  const health: Record<string, any> = {
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  };

  // Check DB connectivity if prisma is attached
  if (req.db) {
    try {
      await (req.db as any).$queryRaw`SELECT 1`;
      health.database = 'connected';
    } catch {
      health.database = 'disconnected';
      health.status = 'degraded';
    }
  }

  const statusCode = health.status === 'ok' ? 200 : 503;

  res.status(statusCode).json({
    success: health.status === 'ok',
    statusCode,
    message: `Service is ${health.status}`,
    data: health,
  });
});
