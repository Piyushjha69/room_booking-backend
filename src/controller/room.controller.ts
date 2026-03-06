import { Request, Response, NextFunction } from 'express';
import { RoomService } from '../services/room.services';
import { sendSuccess } from '../utils/apiResponse';
import { ValidationError } from '../errors/AppError';

export const getAllRoomsController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const roomService = new RoomService(req.db!);
    const rooms = await roomService.getAllRooms();

    sendSuccess(res, 200, 'Rooms retrieved successfully', rooms);
  } catch (error) {
    next(error);
  }
};

export const getRoomByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    if (!id) {
      throw new ValidationError('Room ID is required');
    }

    const roomService = new RoomService(req.db!);
    const room = await roomService.getRoomById(id);

    sendSuccess(res, 200, 'Room retrieved successfully', room);
  } catch (error) {
    next(error);
  }
};

export const getAvailableRoomsController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      throw new ValidationError('Start date and end date are required');
    }

    const start = new Date(startDate as string);
    const end = new Date(endDate as string);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new ValidationError('Invalid date format');
    }

    if (end <= start) {
      throw new ValidationError('End date must be after start date');
    }

    const roomService = new RoomService(req.db!);
    const rooms = await roomService.getAvailableRooms(start, end);

    sendSuccess(res, 200, 'Available rooms retrieved successfully', rooms);
  } catch (error) {
    next(error);
  }
};
