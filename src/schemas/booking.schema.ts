import { z } from 'zod';

export const CreateBookingSchema = z.object({
  roomId: z.string().uuid('Invalid room ID'),
  startDate: z.string().datetime('Invalid start date format').or(z.date()),
  endDate: z.string().datetime('Invalid end date format').or(z.date()),
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
  startDate: z.string().datetime('Invalid start date format').or(z.date()).optional(),
  endDate: z.string().datetime('Invalid end date format').or(z.date()).optional(),
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
