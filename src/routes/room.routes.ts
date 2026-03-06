import { Router } from 'express';
import {
  getAllRoomsController,
  getRoomByIdController,
  getAvailableRoomsController,
} from '../controller/room.controller';

export const roomRouter = Router();

roomRouter.get('/api/rooms', getAllRoomsController);
roomRouter.get('/api/rooms/available', getAvailableRoomsController);
roomRouter.get('/api/rooms/:id', getRoomByIdController);
