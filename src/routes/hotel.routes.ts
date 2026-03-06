import { Router } from 'express';
import {
  createHotelController,
  updateHotelController,
  deleteHotelController,
  getAllHotelsController,
  getHotelByIdController,
  addRoomToHotelController,
  updateRoomController,
  deleteRoomController,
} from '../controller/hotel.controller';
import { authMiddleware } from '../middleware/authMiddleware';
import { adminMiddleware } from '../middleware/adminMiddleware';

export const hotelRouter = Router();

hotelRouter.post('/api/hotels', authMiddleware, adminMiddleware, createHotelController);
hotelRouter.put('/api/hotels/:id', authMiddleware, adminMiddleware, updateHotelController);
hotelRouter.delete('/api/hotels/:id', authMiddleware, adminMiddleware, deleteHotelController);
hotelRouter.post('/api/hotels/:hotelId/rooms', authMiddleware, adminMiddleware, addRoomToHotelController);

hotelRouter.put('/api/rooms/:roomId', authMiddleware, adminMiddleware, updateRoomController);
hotelRouter.delete('/api/rooms/:roomId', authMiddleware, adminMiddleware, deleteRoomController);

hotelRouter.get('/api/hotels', getAllHotelsController);
hotelRouter.get('/api/hotels/:id', getHotelByIdController);
