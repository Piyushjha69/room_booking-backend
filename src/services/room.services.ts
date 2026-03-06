import { PrismaClient } from '../generated/prisma';
import { NotFoundError, ValidationError } from '../errors/AppError';

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

  async createRoom(hotelId: string, name: string, pricePerNight: number) {
    if (!hotelId) {
      throw new ValidationError('Hotel ID is required');
    }

    if (!name || name.trim().length === 0) {
      throw new ValidationError('Room name is required');
    }

    if (!pricePerNight || pricePerNight <= 0) {
      throw new ValidationError('Price per night must be greater than 0');
    }

    const hotel = await this.prisma.hotel.findUnique({
      where: { id: hotelId },
    });

    if (!hotel) {
      throw new NotFoundError('Hotel not found');
    }

    return await this.prisma.room.create({
      data: {
        name,
        pricePerNight,
        hotelId,
      },
      include: {
        hotel: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async updateRoom(roomId: string, name?: string, pricePerNight?: number) {
    if (!roomId) {
      throw new ValidationError('Room ID is required');
    }

    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      throw new NotFoundError('Room not found');
    }

    const updateData: any = {};
    
    if (name !== undefined) {
      if (!name || name.trim().length === 0) {
        throw new ValidationError('Room name cannot be empty');
      }
      updateData.name = name;
    }

    if (pricePerNight !== undefined) {
      if (pricePerNight <= 0) {
        throw new ValidationError('Price per night must be greater than 0');
      }
      updateData.pricePerNight = pricePerNight;
    }

    return await this.prisma.room.update({
      where: { id: roomId },
      data: updateData,
      include: {
        hotel: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async deleteRoom(roomId: string) {
    if (!roomId) {
      throw new ValidationError('Room ID is required');
    }

    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      throw new NotFoundError('Room not found');
    }

    return await this.prisma.room.delete({
      where: { id: roomId },
    });
  }
}
