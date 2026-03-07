import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '../generated/prisma';
import { sendSuccess } from '../utils/apiResponse';
import { NotFoundError, ValidationError } from '../errors/AppError';

export const getAdminStatsController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const prisma = req.db! as PrismaClient;

    const [hotelsCount, roomsCount, bookingsCount, usersCount] = await Promise.all([
      prisma.hotel.count(),
      prisma.room.count(),
      prisma.booking.count(),
      prisma.user.count(),
    ]);

    sendSuccess(res, 200, 'Admin stats retrieved successfully', {
      hotels: hotelsCount,
      rooms: roomsCount,
      bookings: bookingsCount,
      users: usersCount,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllUsersController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const prisma = req.db! as PrismaClient;

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    sendSuccess(res, 200, 'Users retrieved successfully', users);
  } catch (error) {
    next(error);
  }
};

export const updateUserRoleController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const prisma = req.db! as PrismaClient;
    const userId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { role } = req.body;

    if (!userId) {
      throw new ValidationError('User ID is required');
    }

    if (!role || !['USER', 'ADMIN'].includes(role)) {
      throw new ValidationError('Invalid role. Must be USER or ADMIN');
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    sendSuccess(res, 200, 'User role updated successfully', updatedUser);
  } catch (error) {
    next(error);
  }
};
