import { Request, Response, NextFunction } from 'express';
import { BookingService } from '../services/booking.services';
import { sendSuccess } from '../utils/apiResponse';
import { ValidationError } from '../errors/AppError';

export const createBookingController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new ValidationError('User not authenticated');
    }

    const bookingService = new BookingService(req.db!);
    const booking = await bookingService.createBooking(userId, req.body);

    sendSuccess(res, 201, 'Booking created successfully', booking);
  } catch (error) {
    next(error);
  }
};

export const getUserBookingsController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new ValidationError('User not authenticated');
    }

    const bookingService = new BookingService(req.db!);
    const bookings = await bookingService.getBookingsByUserId(userId);

    sendSuccess(res, 200, 'Bookings retrieved successfully', bookings);
  } catch (error) {
    next(error);
  }
};

export const getBookingByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const userId = req.user?.id;

    if (!id) {
      throw new ValidationError('Booking ID is required');
    }

    if (!userId) {
      throw new ValidationError('User not authenticated');
    }

    const bookingService = new BookingService(req.db!);
    const booking = await bookingService.getBookingById(id, userId);

    sendSuccess(res, 200, 'Booking retrieved successfully', booking);
  } catch (error) {
    next(error);
  }
};

export const updateBookingController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const userId = req.user?.id;

    if (!id) {
      throw new ValidationError('Booking ID is required');
    }

    if (!userId) {
      throw new ValidationError('User not authenticated');
    }

    const bookingService = new BookingService(req.db!);
    const booking = await bookingService.updateBooking(id, userId, req.body);

    sendSuccess(res, 200, 'Booking updated successfully', booking);
  } catch (error) {
    next(error);
  }
};

export const cancelBookingController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const userId = req.user?.id;

    if (!id) {
      throw new ValidationError('Booking ID is required');
    }

    if (!userId) {
      throw new ValidationError('User not authenticated');
    }

    const bookingService = new BookingService(req.db!);
    const booking = await bookingService.cancelBooking(id, userId);

    sendSuccess(res, 200, 'Booking canceled successfully', booking);
  } catch (error) {
    next(error);
  }
};

export const deleteBookingController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const userId = req.user?.id;

    if (!id) {
      throw new ValidationError('Booking ID is required');
    }

    if (!userId) {
      throw new ValidationError('User not authenticated');
    }

    const bookingService = new BookingService(req.db!);
    await bookingService.deleteBooking(id, userId);

    sendSuccess(res, 200, 'Booking deleted successfully', {});
  } catch (error) {
    next(error);
  }
};
