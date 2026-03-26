import express, { Express, NextFunction, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from './generated/prisma';
import { validateEnvironment } from './utils/env.utils';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';
import { apiLimiter, authLimiter, bookingLimiter } from './middleware/rateLimiter';
import { authRouter } from './routes/auth.routes';
import { roomRouter } from './routes/room.routes';
import { bookingRouter } from './routes/booking.routes';
import { hotelRouter } from './routes/hotel.routes';
import { adminRouter } from './routes/admin.routes';
import { healthRouter } from './routes/health.routes';
import { requestTimeout } from './middleware/requestTimeout';

dotenv.config();

try {
  validateEnvironment();
} catch (error) {
  console.error('Environment validation failed:', error);
  process.exit(1);
}

const app: Express = express();
const PORT = parseInt(process.env.PORT || '5000', 10);

// Trust proxy — CRITICAL when behind Nginx/Cloudflare/load balancer
// Without this, all users share the same IP (127.0.0.1) and hit shared rate limits
app.set('trust proxy', 1);

let prisma: PrismaClient | null = null;

const getPrismaClient = (): PrismaClient => {
  if (!prisma) {
    prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development'
        ? ['query', 'warn', 'error']
        : ['warn', 'error'],
    });
  }
  return prisma;
};

// Payload size limits — prevent oversized request bodies from crashing the server
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cors());

// Request timeout — prevent hanging requests from exhausting connections
app.use(requestTimeout(30000)); // 30 seconds

// Apply request logging
app.use(requestLogger);

// Health check — no rate limiting, no auth (for load balancers/monitoring)
app.use(healthRouter);

// Apply general API rate limiting to all /api routes
app.use('/api', apiLimiter);

// Apply stricter rate limiting to auth endpoints
// NOTE: These are MORE SPECIFIC path matchers and run AFTER apiLimiter.
// Since apiLimiter already counted the request, authLimiter/bookingLimiter
// only add an additional stricter layer for their specific paths.
app.use('/api/auth', authLimiter);

// Booking rate limiter — only counts POST requests (see rateLimiter.ts skip logic)
app.use('/api/bookings', bookingLimiter);

app.use((req: Request, res: Response, next: NextFunction) => {
  req.db = getPrismaClient();
  next();
});

app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Room Booking Backend API' });
});

app.use(authRouter);
app.use(hotelRouter);
app.use(roomRouter);
app.use(bookingRouter);
app.use(adminRouter);

// Error handler MUST be registered BEFORE the 404 catch-all
// Express 5 error handlers must have 4 parameters to be recognized
app.use(errorHandler);

// 404 catch-all — AFTER all routes and error handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    statusCode: 404,
    message: `Route not found: ${req.method} ${req.path}`,
    error: 'Not Found',
  });
});

const start = async () => {
  try {
    // Eagerly connect to DB to fail fast on startup
    const client = getPrismaClient();
    await client.$connect();
    console.log('✅ Database connected');

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server listening on http://0.0.0.0:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

// Catch unhandled promise rejections — prevents silent crashes
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully...');
  if (prisma) await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  if (prisma) await prisma.$disconnect();
  process.exit(0);
});

start();
