import { PrismaClient } from '../generated/prisma';
import { NotFoundError } from '../errors/AppError';

export class RoomService {
  constructor(private prisma: PrismaClient) {}

  async getAllRooms() {
    const rooms = await this.prisma.room.findMany({
      select: {
        id: true,
        name: true,
        pricePerNight: true,
        hotelId: true,
        hotel: {
          select: {
            id: true,
            name: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return rooms;
  }

  async getRoomById(roomId: string) {
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
      select: {
        id: true,
        name: true,
        pricePerNight: true,
        hotelId: true,
        hotel: {
          select: {
            id: true,
            name: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!room) {
      throw new NotFoundError('Room not found');
    }

    return room;
  }

  async getAvailableRooms(startDate: Date, endDate: Date) {
    // Get rooms that don't have overlapping bookings in the given date range
    const bookedRooms = await this.prisma.booking.findMany({
      where: {
        AND: [
          { startDate: { lt: endDate } },
          { endDate: { gt: startDate } },
          { bookingStatus: { not: 'CANCELED' } },
        ],
      },
      select: {
        roomId: true,
      },
    });

    const bookedRoomIds = bookedRooms.map((b) => b.roomId);

    const availableRooms = await this.prisma.room.findMany({
      where: {
        id: {
          notIn: bookedRoomIds,
        },
      },
      select: {
        id: true,
        name: true,
        pricePerNight: true,
        hotelId: true,
        hotel: {
          select: {
            id: true,
            name: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return availableRooms;
  }
}
