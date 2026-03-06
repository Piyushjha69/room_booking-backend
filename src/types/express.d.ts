import 'express';
import { PrismaClient } from '../generated/prisma';

declare global {
  namespace Express {
    interface Request {
      db?: PrismaClient;
      user?: {
        id: string;
        email: string;
        role: string;
      };
    }
  }
}
