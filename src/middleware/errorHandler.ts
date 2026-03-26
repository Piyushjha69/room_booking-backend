import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';

// Prisma error codes: https://www.prisma.io/docs/orm/reference/error-reference
const PRISMA_ERROR_MAP: Record<string, { status: number; message: string }> = {
  P2002: { status: 409, message: 'A record with this value already exists' },
  P2025: { status: 404, message: 'Record not found' },
  P2003: { status: 400, message: 'Invalid reference — related record not found' },
  P2024: { status: 503, message: 'Database connection pool timeout — please retry' },
};

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Structured error log with request context
  console.error('❌ Error:', {
    message: err.message,
    name: err.name,
    path: req.path,
    method: req.method,
    ip: req.ip,
    userId: req.user?.id,
    timestamp: new Date().toISOString(),
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });

  // Handle known operational errors
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      statusCode: err.statusCode,
      message: err.message,
      error: process.env.NODE_ENV === 'production' ? undefined : err.message,
    });
    return;
  }

  // Handle Prisma client known request errors
  const prismaError = err as any;
  if (prismaError.code && PRISMA_ERROR_MAP[prismaError.code]) {
    const mapped = PRISMA_ERROR_MAP[prismaError.code];
    res.status(mapped.status).json({
      success: false,
      statusCode: mapped.status,
      message: mapped.message,
      error: process.env.NODE_ENV === 'production' ? undefined : prismaError.meta?.cause || prismaError.message,
    });
    return;
  }

  // Handle JSON parse errors (malformed request body)
  if (err.name === 'SyntaxError' && (err as any).status === 400) {
    res.status(400).json({
      success: false,
      statusCode: 400,
      message: 'Invalid JSON in request body',
      error: process.env.NODE_ENV === 'production' ? undefined : err.message,
    });
    return;
  }

  // Handle payload too large
  if (err.name === 'PayloadTooLargeError' || (err as any).type === 'entity.too.large') {
    res.status(413).json({
      success: false,
      statusCode: 413,
      message: 'Request payload too large',
      error: 'Payload Too Large',
    });
    return;
  }

  // Fallback — unknown/unexpected errors
  res.status(500).json({
    success: false,
    statusCode: 500,
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'production' ? undefined : err.message,
  });
};
