import express, { Express, NextFunction, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from './generated/prisma';
import { validateEnvironment } from './utils/env.utils';
import { errorHandler } from './middleware/errorHandler';
import { authRouter } from './routes/auth.routes';

dotenv.config();

try {
  validateEnvironment();
} catch (error) {
  console.error('Environment validation failed:', error);
  process.exit(1);
}

const app: Express = express();
const PORT = parseInt(process.env.PORT || '5000', 10);
let prisma: any = null;

const getPrismaClient = () => {
  if (!prisma) {
    prisma = new PrismaClient();
  }
  return prisma;
};

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use((req: Request, res: Response, next: NextFunction) => {
  req.db = getPrismaClient();
  next();
});

app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Room Booking Backend API' });
});

app.use(authRouter);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    statusCode: 404,
    message: `Route not found: ${req.method} ${req.path}`,
    error: 'Not Found',
  });
});

app.use(errorHandler);

const start = async () => {
  try {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server listening on http://0.0.0.0:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

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
