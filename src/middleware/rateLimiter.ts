import { Request, Response } from 'express';
import rateLimit from 'express-rate-limit';

const isDevelopment = process.env.NODE_ENV === 'development';

// Key generator: use authenticated user ID if available, otherwise IP
const keyGenerator = (req: Request): string => {
  if (req.user?.id) return req.user.id;
  // req.ip respects trust proxy setting
  return req.ip || 'unknown';
};

// General API rate limiter
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDevelopment ? 1000 : 200, // 200 in production (was 100 — too low for SPAs)
  skip: () => isDevelopment,
  keyGenerator,
  message: {
    success: false,
    statusCode: 429,
    message: 'Too many requests, please try again later.',
    error: 'Rate Limit Exceeded',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Auth endpoints stricter rate limiter
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDevelopment ? 100 : 10, // 10 failed auth attempts per 15 min
  skip: () => isDevelopment,
  skipSuccessfulRequests: true,
  keyGenerator: (req: Request): string => req.ip || 'unknown', // always IP-based for auth
  message: {
    success: false,
    statusCode: 429,
    message: 'Too many authentication attempts, please try again after 15 minutes.',
    error: 'Rate Limit Exceeded',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    console.warn('⚠️ Auth rate limit exceeded:', {
      ip: req.ip,
      path: req.path,
      method: req.method,
      timestamp: new Date().toISOString(),
    });

    res.status(429).json({
      success: false,
      statusCode: 429,
      message: 'Too many authentication attempts, please try again after 15 minutes.',
      error: 'Rate Limit Exceeded',
    });
  },
});

// Booking creation rate limiter — only applies to POST (create), not GET (list)
export const bookingLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: isDevelopment ? 30 : 10, // 10 per minute (was 3 — too strict, blocked normal use)
  skip: (req: Request) => isDevelopment || req.method !== 'POST', // only limit creation, not reads
  keyGenerator,
  message: {
    success: false,
    statusCode: 429,
    message: 'Too many booking attempts, please slow down.',
    error: 'Rate Limit Exceeded',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
