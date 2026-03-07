export interface RoomInput {
  name: string;
  pricePerNight: number;
}

export interface RoomGroup {
  type: string;
  pricePerNight: number;
  count: number;
}

export interface CreateHotelDTO {
  name: string;
  rooms?: RoomInput[];
  roomGroups?: RoomGroup[];
}

export interface UpdateHotelDTO {
  name: string;
}

export interface AddRoomDTO {
  name: string;
  pricePerNight: number;
}

export interface UpdateRoomDTO {
  name?: string;
  pricePerNight?: number;
}

export interface HotelResponse {
  id: string;
  name: string;
  rooms: RoomResponse[];
}

export interface RoomResponse {
  id: string;
  name: string;
  pricePerNight: string;
  hotelId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RoomTypeGroup {
  type: string;
  count: number;
  pricePerNight: number;
}

export interface HotelWithRoomTypes {
  id: string;
  name: string;
  roomTypes: RoomTypeGroup[];
  totalRooms: number;
  minPrice: number;
  maxPrice: number;
}
