import { Router } from 'express';
import {
  createBookingController,
  getUserBookingsController,
  getBookingByIdController,
  updateBookingController,
  cancelBookingController,
  deleteBookingController,
} from '../controller/booking.controller';
import { authMiddleware } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validationMiddleware';
import { CreateBookingSchema, UpdateBookingSchema } from '../schemas/booking.schema';

export const bookingRouter = Router();

// All booking routes require authentication
bookingRouter.use(authMiddleware);

bookingRouter.post(
  '/api/bookings',
  validateRequest(CreateBookingSchema),
  createBookingController
);
bookingRouter.get('/api/bookings', getUserBookingsController);
bookingRouter.get('/api/bookings/:id', getBookingByIdController);
bookingRouter.patch(
  '/api/bookings/:id',
  validateRequest(UpdateBookingSchema),
  updateBookingController
);
bookingRouter.post('/api/bookings/:id/cancel', cancelBookingController);
bookingRouter.delete('/api/bookings/:id', deleteBookingController);
