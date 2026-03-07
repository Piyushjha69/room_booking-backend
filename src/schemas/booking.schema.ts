import { z } from 'zod';

const isoDateString = z.string().refine((val) => {
  const date = new Date(val);
  return !isNaN(date.getTime()) && date.toISOString() === val;
}, 'Invalid ISO date format');

const flexibleDateString = z.string().refine((val) => {
  const date = new Date(val);
  return !isNaN(date.getTime());
}, 'Invalid date format');

export const CreateBookingSchema = z.object({
  roomType: z.string().min(1, 'Room type is required'),
  hotelId: z.string().uuid('Invalid hotel ID'),
  startDate: isoDateString,
  endDate: isoDateString,
}).refine(
  (data) => {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    return end > start;
  },
  {
    message: 'End date must be after start date',
    path: ['endDate'],
  }
);

export const CreateBookingByIdSchema = z.object({
  roomId: z.string().uuid('Invalid room ID'),
  startDate: isoDateString,
  endDate: isoDateString,
}).refine(
  (data) => {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    return end > start;
  },
  {
    message: 'End date must be after start date',
    path: ['endDate'],
  }
);

export const UpdateBookingSchema = z.object({
  startDate: isoDateString.optional(),
  endDate: isoDateString.optional(),
  bookingStatus: z.enum(['AVAILABLE', 'PENDING', 'BOOKED', 'CANCELED']).optional(),
}).refine(
  (data) => {
    if (data.startDate && data.endDate) {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      return end > start;
    }
    return true;
  },
  {
    message: 'End date must be after start date',
    path: ['endDate'],
  }
);

export type CreateBookingDTO = z.infer<typeof CreateBookingSchema>;
export type UpdateBookingDTO = z.infer<typeof UpdateBookingSchema>;
