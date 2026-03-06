export interface RoomInput {
  name: string;
  pricePerNight: number;
}

export interface CreateHotelDTO {
  name: string;
  rooms?: RoomInput[];
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
