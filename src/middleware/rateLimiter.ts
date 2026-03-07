import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';

// General API rate limiter
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    statusCode: 429,
    message: 'Too many requests, please try again later.',
    error: 'Rate Limit Exceeded',
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Auth endpoints stricter rate limiter
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 attempts per windowMs (login/register)
  message: {
    success: false,
    statusCode: 429,
    message: 'Too many authentication attempts, please try again after 15 minutes.',
    error: 'Rate Limit Exceeded',
  },
  skipSuccessfulRequests: true, // Don't count successful requests
  standardHeaders: true,
  legacyHeaders: false,
});

// Booking creation rate limiter
export const bookingLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 3, // Limit each IP to 3 booking creations per minute
  message: {
    success: false,
    statusCode: 429,
    message: 'Too many booking attempts, please slow down.',
    error: 'Rate Limit Exceeded',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
