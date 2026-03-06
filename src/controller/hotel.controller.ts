import { Request, Response, NextFunction } from 'express';
import { HotelService } from '../services/hotel.services';
import { sendSuccess } from '../utils/apiResponse';
import { ValidationError } from '../errors/AppError';
import { CreateHotelDTO, UpdateHotelDTO, AddRoomDTO, UpdateRoomDTO } from '../types/hotel.types';

export const createHotelController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data: CreateHotelDTO = req.body;

    const hotelService = new HotelService(req.db!);
    const hotel = await hotelService.createHotel(data);

    sendSuccess(res, 201, 'Hotel created successfully', hotel);
  } catch (error) {
    next(error);
  }
};

export const updateHotelController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const hotelId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const data: UpdateHotelDTO = req.body;

    const hotelService = new HotelService(req.db!);
    const hotel = await hotelService.updateHotel(hotelId, data);

    sendSuccess(res, 200, 'Hotel updated successfully', hotel);
  } catch (error) {
    next(error);
  }
};

export const deleteHotelController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const hotelId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    if (!hotelId) {
      throw new ValidationError('Hotel ID is required');
    }

    const hotelService = new HotelService(req.db!);
    await hotelService.deleteHotel(hotelId);

    sendSuccess(res, 200, 'Hotel deleted successfully', null);
  } catch (error) {
    next(error);
  }
};

export const getAllHotelsController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const hotelService = new HotelService(req.db!);
    const hotels = await hotelService.getAllHotels();

    sendSuccess(res, 200, 'Hotels retrieved successfully', hotels);
  } catch (error) {
    next(error);
  }
};

export const getHotelByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const hotelId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    if (!hotelId) {
      throw new ValidationError('Hotel ID is required');
    }

    const hotelService = new HotelService(req.db!);
    const hotel = await hotelService.getHotelById(hotelId);

    sendSuccess(res, 200, 'Hotel retrieved successfully', hotel);
  } catch (error) {
    next(error);
  }
};

export const addRoomToHotelController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const hotelId = Array.isArray(req.params.hotelId) ? req.params.hotelId[0] : req.params.hotelId;
    const data: AddRoomDTO = req.body;

    const hotelService = new HotelService(req.db!);
    const room = await hotelService.addRoomToHotel(hotelId, data);

    sendSuccess(res, 201, 'Room added successfully', room);
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
    const roomId = Array.isArray(req.params.roomId) ? req.params.roomId[0] : req.params.roomId;
    const data: UpdateRoomDTO = req.body;

    const hotelService = new HotelService(req.db!);
    const room = await hotelService.updateRoom(roomId, data);

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
    const roomId = Array.isArray(req.params.roomId) ? req.params.roomId[0] : req.params.roomId;

    const hotelService = new HotelService(req.db!);
    await hotelService.deleteRoom(roomId);

    sendSuccess(res, 200, 'Room deleted successfully', null);
  } catch (error) {
    next(error);
  }
};
