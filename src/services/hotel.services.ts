import { PrismaClient } from '../generated/prisma';
import { ConflictError, NotFoundError, ValidationError } from '../errors/AppError';
import { CreateHotelDTO, RoomInput, AddRoomDTO, UpdateRoomDTO, UpdateHotelDTO } from '../types/hotel.types';

export class HotelService {
  constructor(private prisma: PrismaClient) {}

  private validateRoomInput(room: RoomInput): void {
    if (!room.name || room.name.trim().length === 0) {
      throw new ValidationError('Room name is required');
    }
    if (room.pricePerNight <= 0) {
      throw new ValidationError('Room price must be greater than 0');
    }
  }

  private validateRoomsForDuplicates(rooms: RoomInput[]): void {
    const names = rooms.map(r => r.name.toLowerCase());
    const uniqueNames = new Set(names);
    if (names.length !== uniqueNames.size) {
      throw new ValidationError('Duplicate room names are not allowed');
    }
  }

  async createHotel(data: CreateHotelDTO) {
    if (!data.name || data.name.trim().length === 0) {
      throw new ValidationError('Hotel name is required');
    }

    const rooms = data.rooms || [];

    const existingHotel = await this.prisma.hotel.findFirst({
      where: {
        name: {
          equals: data.name,
        },
      },
    });

    if (existingHotel) {
      throw new ConflictError('Hotel with this name already exists');
    }

    if (rooms.length > 0) {
      rooms.forEach(room => this.validateRoomInput(room));
      this.validateRoomsForDuplicates(rooms);
    }

    return await this.prisma.hotel.create({
      data: {
        name: data.name,
        rooms: {
          create: rooms.map(room => ({
            name: room.name,
            pricePerNight: room.pricePerNight,
          })),
        },
      },
      include: { rooms: true },
    });
  }

  async updateHotel(hotelId: string, data: UpdateHotelDTO) {
    if (!hotelId) {
      throw new ValidationError('Hotel ID is required');
    }

    if (!data.name || data.name.trim().length === 0) {
      throw new ValidationError('Hotel name is required');
    }

    const hotel = await this.prisma.hotel.findUnique({
      where: { id: hotelId },
    });

    if (!hotel) {
      throw new NotFoundError('Hotel not found');
    }

    const existingHotel = await this.prisma.hotel.findFirst({
      where: {
        name: {
          equals: data.name,
        },
        NOT: {
          id: hotelId,
        },
      },
    });

    if (existingHotel) {
      throw new ConflictError('Hotel with this name already exists');
    }

    return await this.prisma.hotel.update({
      where: { id: hotelId },
      data: { name: data.name },
      include: { rooms: true },
    });
  }

  async addRoomToHotel(hotelId: string, data: AddRoomDTO) {
    if (!hotelId) {
      throw new ValidationError('Hotel ID is required');
    }

    const hotel = await this.prisma.hotel.findUnique({
      where: { id: hotelId },
    });

    if (!hotel) {
      throw new NotFoundError('Hotel not found');
    }

    this.validateRoomInput(data);

    const existingRoom = await this.prisma.room.findFirst({
      where: {
        hotelId,
        name: {
          equals: data.name,
        },
      },
    });

    if (existingRoom) {
      throw new ConflictError('Room with this name already exists in this hotel');
    }

    return await this.prisma.room.create({
      data: {
        name: data.name,
        pricePerNight: data.pricePerNight,
        hotelId,
      },
    });
  }

  async updateRoom(roomId: string, data: UpdateRoomDTO) {
    if (!roomId) {
      throw new ValidationError('Room ID is required');
    }

    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      throw new NotFoundError('Room not found');
    }

    if (data.name) {
      if (data.name.trim().length === 0) {
        throw new ValidationError('Room name cannot be empty');
      }

      const existingRoom = await this.prisma.room.findFirst({
        where: {
          hotelId: room.hotelId,
          name: {
            equals: data.name,
          },
          NOT: {
            id: roomId,
          },
        },
      });

      if (existingRoom) {
        throw new ConflictError('Room with this name already exists in this hotel');
      }
    }

    if (data.pricePerNight !== undefined && data.pricePerNight <= 0) {
      throw new ValidationError('Room price must be greater than 0');
    }

    return await this.prisma.room.update({
      where: { id: roomId },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.pricePerNight !== undefined && { pricePerNight: data.pricePerNight }),
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

  async deleteHotel(hotelId: string) {
    if (!hotelId) {
      throw new ValidationError('Hotel ID is required');
    }

    const hotel = await this.prisma.hotel.findUnique({
      where: { id: hotelId },
      include: { rooms: true },
    });

    if (!hotel) {
      throw new NotFoundError('Hotel not found');
    }

    return await this.prisma.hotel.delete({
      where: { id: hotelId },
    });
  }

  async getAllHotels() {
    return await this.prisma.hotel.findMany({
      include: { rooms: true },
    });
  }

  async getHotelById(hotelId: string) {
    if (!hotelId) {
      throw new ValidationError('Hotel ID is required');
    }

    const hotel = await this.prisma.hotel.findUnique({
      where: { id: hotelId },
      include: { rooms: true },
    });

    if (!hotel) {
      throw new NotFoundError('Hotel not found');
    }

    return hotel;
  }
}
