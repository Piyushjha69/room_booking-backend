import { PrismaClient } from '../generated/prisma';
import { CreateBookingDTO, UpdateBookingDTO } from '../schemas/booking.schema';
import { NotFoundError, ConflictError, ValidationError } from '../errors/AppError';

export class BookingService {
  constructor(private prisma: PrismaClient) {}

  async createBooking(userId: string, data: CreateBookingDTO) {
    const { roomId, startDate, endDate } = data;

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Verify room exists
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
      select: { id: true, pricePerNight: true },
    });

    if (!room) {
      throw new NotFoundError('Room not found');
    }

    // Use transaction to ensure atomic booking creation
    const booking = await this.prisma.$transaction(async (tx) => {
      // Check for overlapping bookings
      const overlappingBooking = await tx.booking.findFirst({
        where: {
          roomId,
          bookingStatus: { not: 'CANCELED' },
          AND: [
            { startDate: { lt: end } },
            { endDate: { gt: start } },
          ],
        },
      });

      if (overlappingBooking) {
        throw new ConflictError(
          'Room is already booked for the selected date range'
        );
      }

      // Create the booking
      return await tx.booking.create({
        data: {
          userId,
          roomId,
          startDate: start,
          endDate: end,
          bookingStatus: 'PENDING',
        },
        select: {
          id: true,
          userId: true,
          roomId: true,
          startDate: true,
          endDate: true,
          bookingStatus: true,
          createdAt: true,
          room: {
            select: {
              id: true,
              name: true,
              pricePerNight: true,
              hotel: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
      });
    });

    return booking;
  }

  async getBookingsByUserId(userId: string) {
    const bookings = await this.prisma.booking.findMany({
      where: { userId },
      select: {
        id: true,
        userId: true,
        roomId: true,
        startDate: true,
        endDate: true,
        bookingStatus: true,
        createdAt: true,
        room: {
          select: {
            id: true,
            name: true,
            pricePerNight: true,
            hotel: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return bookings;
  }

  async getBookingById(bookingId: string, userId?: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      select: {
        id: true,
        userId: true,
        roomId: true,
        startDate: true,
        endDate: true,
        bookingStatus: true,
        createdAt: true,
        room: {
          select: {
            id: true,
            name: true,
            pricePerNight: true,
            hotel: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    if (!booking) {
      throw new NotFoundError('Booking not found');
    }

    // Check if user is authorized to view this booking
    if (userId && booking.userId !== userId) {
      throw new NotFoundError('Booking not found');
    }

    return booking;
  }

  async updateBooking(
    bookingId: string,
    userId: string,
    data: UpdateBookingDTO
  ) {
    // Get existing booking
    const existingBooking = await this.getBookingById(bookingId, userId);

    // If trying to update dates, check for overlaps
    if (data.startDate || data.endDate) {
      const start = new Date(data.startDate || existingBooking.startDate);
      const end = new Date(data.endDate || existingBooking.endDate);

      const overlappingBooking = await this.prisma.booking.findFirst({
        where: {
          roomId: existingBooking.roomId,
          id: { not: bookingId },
          bookingStatus: { not: 'CANCELED' },
          AND: [
            { startDate: { lt: end } },
            { endDate: { gt: start } },
          ],
        },
      });

      if (overlappingBooking) {
        throw new ConflictError(
          'Room is already booked for the selected date range'
        );
      }
    }

    const updated = await this.prisma.booking.update({
      where: { id: bookingId },
      data: {
        ...(data.startDate && { startDate: new Date(data.startDate) }),
        ...(data.endDate && { endDate: new Date(data.endDate) }),
        ...(data.bookingStatus && { bookingStatus: data.bookingStatus }),
      },
      select: {
        id: true,
        userId: true,
        roomId: true,
        startDate: true,
        endDate: true,
        bookingStatus: true,
        createdAt: true,
        room: {
          select: {
            id: true,
            name: true,
            pricePerNight: true,
            hotel: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return updated;
  }

  async cancelBooking(bookingId: string, userId: string) {
    await this.getBookingById(bookingId, userId);

    const updated = await this.prisma.booking.update({
      where: { id: bookingId },
      data: { bookingStatus: 'CANCELED' },
      select: {
        id: true,
        userId: true,
        roomId: true,
        startDate: true,
        endDate: true,
        bookingStatus: true,
        createdAt: true,
      },
    });

    return updated;
  }

  async deleteBooking(bookingId: string, userId: string) {
    await this.getBookingById(bookingId, userId);

    await this.prisma.booking.delete({
      where: { id: bookingId },
    });
  }
}
