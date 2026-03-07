import { Request, Response, NextFunction } from 'express';
import { RoomService } from '../services/room.services';
import { sendSuccess } from '../utils/apiResponse';
import { ValidationError } from '../errors/AppError';
import { Decimal } from '@prisma/client/runtime/library';

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

export const getAvailableRoomTypesController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { startDate, endDate, hotelId } = req.query;

    const roomService = new RoomService(req.db!);
    let rooms;

    if (startDate && endDate) {
      const start = new Date(startDate as string);
      const end = new Date(endDate as string);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        throw new ValidationError('Invalid date format');
      }

      if (end <= start) {
        throw new ValidationError('End date must be after start date');
      }

      rooms = await roomService.getAvailableRoomTypes(
        start,
        end,
        hotelId as string | undefined
      );
    } else {
      rooms = await roomService.getAvailableRoomTypes(
        undefined,
        undefined,
        hotelId as string | undefined
      );
    }

    sendSuccess(res, 200, 'Available room types retrieved successfully', rooms);
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

export const createRoomController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { hotelId, name, pricePerNight } = req.body;

    if (!hotelId || !name || pricePerNight === undefined) {
      throw new ValidationError('Hotel ID, room name, and price per night are required');
    }

    const roomService = new RoomService(req.db!);
    const room = await roomService.createRoom(hotelId, name, parseFloat(pricePerNight));

    sendSuccess(res, 201, 'Room created successfully', room);
  } catch (error) {
    next(error);
  }
};

export const updateRoomController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const roomId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { name, pricePerNight } = req.body;

    if (!roomId) {
      throw new ValidationError('Room ID is required');
    }

    if (name === undefined && pricePerNight === undefined) {
      throw new ValidationError('At least one field must be provided for update');
    }

    const roomService = new RoomService(req.db!);
    const room = await roomService.updateRoom(
      roomId,
      name,
      pricePerNight ? parseFloat(pricePerNight) : undefined
    );

    sendSuccess(res, 200, 'Room updated successfully', room);
  } catch (error) {
    next(error);
  }
};

export const deleteRoomController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const roomId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    if (!roomId) {
      throw new ValidationError('Room ID is required');
    }

    const roomService = new RoomService(req.db!);
    await roomService.deleteRoom(roomId);

    sendSuccess(res, 200, 'Room deleted successfully', null);
  } catch (error) {
    next(error);
  }
};

export const getGroupedRoomsByHotelController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const hotelId = Array.isArray(req.params.hotelId) ? req.params.hotelId[0] : req.params.hotelId;

    if (!hotelId) {
      throw new ValidationError('Hotel ID is required');
    }

    const roomService = new RoomService(req.db!);
    const groupedRooms = await roomService.getGroupedRoomsByHotel(hotelId);

    sendSuccess(res, 200, 'Grouped rooms retrieved successfully', groupedRooms);
  } catch (error) {
    next(error);
  }
};

export const deleteRoomsByTypeController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const hotelId = Array.isArray(req.params.hotelId) ? req.params.hotelId[0] : req.params.hotelId;
    const { roomType } = req.body;

    if (!hotelId) {
      throw new ValidationError('Hotel ID is required');
    }

    if (!roomType) {
      throw new ValidationError('Room type is required');
    }

    const roomService = new RoomService(req.db!);
    await roomService.deleteRoomsByType(hotelId, roomType);

    sendSuccess(res, 200, 'Room type deleted successfully', null);
  } catch (error) {
    next(error);
  }
};
