import { PrismaClient, Decimal } from "../src/generated/prisma";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting database seed...");

  // Clear existing data
  await prisma.booking.deleteMany();
  await prisma.room.deleteMany();
  await prisma.hotel.deleteMany();
  await prisma.user.deleteMany();

  // Create hotels
  const hotel1 = await prisma.hotel.create({
    data: {
      name: "Grand Plaza Hotel",
    },
  });

  const hotel2 = await prisma.hotel.create({
    data: {
      name: "Lakeside Resort",
    },
  });

  // Create rooms for hotel1
  await prisma.room.createMany({
    data: [
      {
        name: "Deluxe Suite",
        pricePerNight: "150.00",
        hotelId: hotel1.id,
      },
      {
        name: "Standard Room",
        pricePerNight: "80.00",
        hotelId: hotel1.id,
      },
      {
        name: "Premium Room",
        pricePerNight: "120.00",
        hotelId: hotel1.id,
      },
    ],
  });

  // Create rooms for hotel2
  await prisma.room.createMany({
    data: [
      {
        name: "Lake View Suite",
        pricePerNight: "200.00",
        hotelId: hotel2.id,
      },
      {
        name: "Garden Room",
        pricePerNight: "110.00",
        hotelId: hotel2.id,
      },
      {
        name: "Standard Lake Room",
        pricePerNight: "95.00",
        hotelId: hotel2.id,
      },
    ],
  });

  // Create additional hotels and rooms for more testing options
  const hotel3 = await prisma.hotel.create({
    data: {
      name: "Mountain Retreat",
    },
  });

  await prisma.room.createMany({
    data: [
      {
        name: "Mountain View Suite",
        pricePerNight: "180.00",
        hotelId: hotel3.id,
      },
      {
        name: "Cozy Cabin Room",
        pricePerNight: "130.00",
        hotelId: hotel3.id,
      },
      {
        name: "Executive Suite",
        pricePerNight: "250.00",
        hotelId: hotel3.id,
      },
      {
        name: "Budget Friendly Room",
        pricePerNight: "60.00",
        hotelId: hotel3.id,
      },
    ],
  });

  const hotel4 = await prisma.hotel.create({
    data: {
      name: "Beach Paradise Resort",
    },
  });

  await prisma.room.createMany({
    data: [
      {
        name: "Ocean Front Suite",
        pricePerNight: "300.00",
        hotelId: hotel4.id,
      },
      {
        name: "Beach Bungalow",
        pricePerNight: "220.00",
        hotelId: hotel4.id,
      },
      {
        name: "Tropical Garden Room",
        pricePerNight: "140.00",
        hotelId: hotel4.id,
      },
    ],
  });

  // Create test users for bookings
  const user1 = await prisma.user.create({
    data: {
      email: "user1@example.com",
      name: "Test User 1",
      password: "hashed_password", // In real app, this would be hashed
      role: "USER",
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: "user2@example.com",
      name: "Test User 2",
      password: "hashed_password",
      role: "USER",
    },
  });

  // Get the first room from hotel1 and hotel2 for bookings
  const rooms = await prisma.room.findMany({
    take: 2,
  });

  if (rooms.length >= 2) {
    // Create active booking (currently ongoing)
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    await prisma.booking.create({
      data: {
        userId: user1.id,
        roomId: rooms[0].id,
        startDate: yesterday,
        endDate: tomorrow,
        bookingStatus: "BOOKED",
      },
    });

    // Create another active booking
    await prisma.booking.create({
      data: {
        userId: user2.id,
        roomId: rooms[1].id,
        startDate: yesterday,
        endDate: nextWeek,
        bookingStatus: "BOOKED",
      },
    });
  }

  console.log("Database seed completed successfully!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
