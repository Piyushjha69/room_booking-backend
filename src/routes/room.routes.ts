import { Router } from 'express';
import {
  getAllRoomsController,
  getRoomByIdController,
  getAvailableRoomsController,
  getAvailableRoomTypesController,
  createRoomController,
  updateRoomController,
  deleteRoomController,
  getGroupedRoomsByHotelController,
  deleteRoomsByTypeController,
} from '../controller/room.controller';
import { authMiddleware } from '../middleware/authMiddleware';
import { adminMiddleware } from '../middleware/adminMiddleware';

export const roomRouter = Router();

roomRouter.post('/api/rooms', authMiddleware, adminMiddleware, createRoomController);
roomRouter.put('/api/rooms/:id', authMiddleware, adminMiddleware, updateRoomController);
roomRouter.delete('/api/rooms/:id', authMiddleware, adminMiddleware, deleteRoomController);

roomRouter.get('/api/rooms', getAllRoomsController);
roomRouter.get('/api/rooms/available', getAvailableRoomsController);
roomRouter.get('/api/rooms/available/types', getAvailableRoomTypesController);
roomRouter.get('/api/rooms/types', getAvailableRoomTypesController);
roomRouter.get('/api/hotels/:hotelId/grouped-rooms', authMiddleware, adminMiddleware, getGroupedRoomsByHotelController);
roomRouter.delete('/api/hotels/:hotelId/rooms-by-type', authMiddleware, adminMiddleware, deleteRoomsByTypeController);
roomRouter.get('/api/rooms/:id', getRoomByIdController);
