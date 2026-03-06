import { PrismaClient, Decimal } from "@prisma/client";

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
