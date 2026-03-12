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

    const [hotelsCount, roomsCount, bookingsCount, usersCount, activeBookingsCount] = await Promise.all([
      prisma.hotel.count(),
      prisma.room.count(),
      prisma.booking.count(),
      prisma.user.count(),
      prisma.booking.count({
        where: {
          bookingStatus: { not: 'CANCELED' },
          startDate: { lte: new Date() },
          endDate: { gte: new Date() },
        },
      }),
    ]);

    sendSuccess(res, 200, 'Admin stats retrieved successfully', {
      hotels: hotelsCount,
      rooms: roomsCount,
      bookings: bookingsCount,
      activeBookings: activeBookingsCount,
      users: usersCount,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllBookingsController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const prisma = req.db! as PrismaClient;
    const { status, page = '1', limit = '20' } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (status && status !== 'all') {
      where.bookingStatus = status.toString().toUpperCase();
    }

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip,
        take: limitNum,
        select: {
          id: true,
          userId: true,
          roomId: true,
          startDate: true,
          endDate: true,
          bookingStatus: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          room: {
            select: {
              id: true,
              name: true,
              pricePerNight: true,
              hotel: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.booking.count({ where }),
    ]);

    sendSuccess(res, 200, 'Bookings retrieved successfully', {
      bookings,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
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
