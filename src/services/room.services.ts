import { PrismaClient } from '../generated/prisma';
import { NotFoundError, ValidationError } from '../errors/AppError';

export interface RoomTypeAvailability {
  roomType: string;
  pricePerNight: number;
  availableRooms: number;
  hotelId: string;
  hotelName: string;
}

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

  async getAvailableRoomTypes(startDate?: Date, endDate?: Date, hotelId?: string) {
    const whereClause: any = {};
    if (hotelId) {
      whereClause.hotelId = hotelId;
    }

    const rooms = await this.prisma.room.findMany({
      where: whereClause,
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
      },
    });

    const roomTypeMap = new Map<string, { ids: string[]; pricePerNight: number; hotelId: string; hotelName: string }>();

    for (const room of rooms) {
      const roomType = room.name.replace(/\s+\d+$/, '').trim();
      if (!roomTypeMap.has(roomType)) {
        roomTypeMap.set(roomType, {
          ids: [room.id],
          pricePerNight: Number(room.pricePerNight),
          hotelId: room.hotelId,
          hotelName: room.hotel.name,
        });
      } else {
        roomTypeMap.get(roomType)!.ids.push(room.id);
      }
    }

    let bookedRoomIdsByType = new Map<string, Set<string>>();
    
    if (startDate && endDate) {
      const bookingWhereClause: any = {
        AND: [
          { startDate: { lt: endDate } },
          { endDate: { gt: startDate } },
          { bookingStatus: { not: 'CANCELED' } },
        ],
      };

      if (hotelId) {
        bookingWhereClause.room = { hotelId };
      }

      const bookings = await this.prisma.booking.findMany({
        where: bookingWhereClause,
        select: {
          roomId: true,
          room: {
            select: {
              name: true,
            },
          },
        },
      });

      for (const booking of bookings) {
        const roomType = booking.room.name.replace(/\s+\d+$/, '').trim();
        if (!bookedRoomIdsByType.has(roomType)) {
          bookedRoomIdsByType.set(roomType, new Set([booking.roomId]));
        } else {
          bookedRoomIdsByType.get(roomType)!.add(booking.roomId);
        }
      }
    }

    const result: RoomTypeAvailability[] = [];

    for (const [roomType, data] of roomTypeMap) {
      const totalRooms = data.ids.length;
      const bookedIds = bookedRoomIdsByType.get(roomType) || new Set<string>();
      const availableRooms = totalRooms - bookedIds.size;

      result.push({
        roomType,
        pricePerNight: data.pricePerNight,
        availableRooms,
        hotelId: data.hotelId,
        hotelName: data.hotelName,
      });
    }
    
    return result.sort((a, b) => a.pricePerNight - b.pricePerNight);
  }

  async getAvailableRooms(startDate: Date, endDate: Date) {
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

  async findAvailableRoomByType(hotelId: string, roomType: string, startDate: Date, endDate: Date) {
    const rooms = await this.prisma.room.findMany({
      where: { hotelId },
      select: {
        id: true,
        name: true,
      },
    });

    const typePattern = new RegExp(`^${roomType}$|^${roomType}\s+\d+$`, 'i');
    const matchingRooms = rooms.filter((r) => typePattern.test(r.name));

    if (matchingRooms.length === 0) {
      throw new NotFoundError('No rooms found for this room type');
    }

    const roomIds = matchingRooms.map((r) => r.id);

    const bookedRooms = await this.prisma.booking.findMany({
      where: {
        roomId: { in: roomIds },
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

    const bookedRoomIds = new Set(bookedRooms.map((b) => b.roomId));

    for (const room of matchingRooms) {
      if (!bookedRoomIds.has(room.id)) {
        return room.id;
      }
    }

    throw new ValidationError('No available rooms of this type for selected dates');
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
