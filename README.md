# Room Booking Backend

A robust, production-ready Express.js backend for the Room Booking System with JWT authentication, Prisma ORM, and MySQL database.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Environment Setup](#environment-setup)
- [Database Setup](#database-setup)
- [API Endpoints](#api-endpoints)
- [Project Structure](#project-structure)
- [Authentication Flow](#authentication-flow)
- [Booking Logic](#booking-logic)
- [Security Features](#security-features)
- [Running Tests](#running-tests)

## ✨ Features

- **JWT Authentication** - Secure access/refresh token system
- **User Management** - Registration, login, logout with role-based access (ADMIN/USER)
- **Room Management** - CRUD operations, availability filtering
- **Hotel Management** - Organize rooms by hotels
- **Booking System** - Create, view, update, cancel bookings
- **Overlap Prevention** - Atomic transactions prevent double-booking
- **Input Validation** - Zod schema validation for all endpoints
- **Rate Limiting** - Protection against brute-force attacks
- **Request Logging** - Comprehensive request/response logging
- **Error Handling** - Standardized API error responses

## 🛠 Tech Stack

- **Runtime**: Node.js 16+
- **Framework**: Express.js 5.2.1
- **Database**: MySQL 8.0+
- **ORM**: Prisma 6.19.2
- **Authentication**: JWT (jsonwebtoken 9.0.3)
- **Password Hashing**: bcrypt 6.0.0
- **Validation**: Zod 4.3.6
- **Language**: TypeScript 5.9.3
- **Rate Limiting**: express-rate-limit

## 📦 Installation

```bash
cd room_booking-backend

# Install dependencies
npm install

# Install rate limiting package (if not already installed)
npm install express-rate-limit
```

## 🚀 Quick Setup (Complete Setup in 3 Steps)

```bash
# 1. Setup environment
# Create .env file with database and JWT secrets (see Environment Setup section below)

# 2. Setup database
npm run prisma:migrate   # Run migrations
npm run prisma:seed      # Seed with sample data

# 3. Start the server
npm run dev
```

The backend will be available at `http://localhost:5000/api`

## ⚙️ Environment Setup

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL=mysql://root:your_password@localhost:3306/room_booking

# JWT Secrets (use strong random strings, min 32 characters)
ACCESS_TOKEN_SECRET=your_super_secret_access_token_key_min_32_chars
REFRESH_TOKEN_SECRET=your_super_secret_refresh_token_key_min_32_chars

# Server Configuration
PORT=5000
NODE_ENV=development
```

## 🗄️ Database Setup

### 1. Create Database

```bash
mysql -u root -p
CREATE DATABASE room_booking;
exit;
```

### 2. Generate Prisma Client

```bash
npm run prisma:generate
```

### 3. Run Migrations

```bash
npm run prisma:migrate
```

### 4. Seed Database

```bash
npm run prisma:seed
```

This creates:
- 4 hotels (Grand Plaza Hotel, Lakeside Resort, Mountain Retreat, Beach Paradise Resort)
- 13 rooms across different price ranges ($60-$300 per night)
- Test users (admin and regular users)

## 📡 API Endpoints

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response (201):**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "User registered successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "uuid",
      "email": "john@example.com",
      "name": "John Doe",
      "role": "USER"
    }
  }
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response (200):** Same structure as register

#### Refresh Token
```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

#### Logout
```http
POST /api/auth/logout
Authorization: Bearer {accessToken}
```

### Room Endpoints

#### Get All Rooms
```http
GET /api/rooms
```

#### Get Room by ID
```http
GET /api/rooms/:roomId
```

#### Get Available Rooms
```http
GET /api/rooms/available?startDate=2024-01-15&endDate=2024-01-20
```

### Booking Endpoints (Protected)

#### Create Booking
```http
POST /api/bookings
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "roomId": "uuid",
  "startDate": "2024-01-15T00:00:00Z",
  "endDate": "2024-01-20T00:00:00Z"
}
```

#### Get My Bookings
```http
GET /api/bookings
Authorization: Bearer {accessToken}
```

#### Get Booking Details
```http
GET /api/bookings/:bookingId
Authorization: Bearer {accessToken}
```

#### Update Booking
```http
PATCH /api/bookings/:bookingId
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "startDate": "2024-01-16T00:00:00Z",
  "endDate": "2024-01-21T00:00:00Z"
}
```

#### Cancel Booking
```http
POST /api/bookings/:bookingId/cancel
Authorization: Bearer {accessToken}
```

#### Delete Booking
```http
DELETE /api/bookings/:bookingId
Authorization: Bearer {accessToken}
```

## 📁 Project Structure

```
room_booking-backend/
├── src/
│   ├── controller/       # Request handlers
│   │   ├── auth.controller.ts
│   │   ├── booking.controller.ts
│   │   ├── hotel.controller.ts
│   │   └── room.controller.ts
│   │
│   ├── services/         # Business logic
│   │   ├── auth.services.ts
│   │   ├── booking.services.ts
│   │   ├── hotel.services.ts
│   │   └── room.services.ts
│   │
│   ├── routes/           # Route definitions
│   │   ├── auth.routes.ts
│   │   ├── booking.routes.ts
│   │   ├── hotel.routes.ts
│   │   └── room.routes.ts
│   │
│   ├── middleware/       # Express middleware
│   │   ├── authMiddleware.ts
│   │   ├── errorHandler.ts
│   │   ├── rateLimiter.ts
│   │   ├── requestLogger.ts
│   │   └── validationMiddleware.ts
│   │
│   ├── schemas/          # Zod validation schemas
│   │   ├── auth.schema.ts
│   │   └── booking.schema.ts
│   │
│   ├── types/            # TypeScript type definitions
│   ├── utils/            # Utility functions
│   │   ├── apiResponse.ts
│   │   ├── env.utils.ts
│   │   ├── jwt.utils.ts
│   │   └── password.utils.ts
│   │
│   ├── errors/           # Custom error classes
│   │   └── AppError.ts
│   │
│   └── server.ts         # Application entry point
│
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── seed.ts           # Database seeding
│
└── package.json
```

## 🔐 Authentication Flow

### 1. Registration/Login
- User submits credentials
- Password is hashed with bcrypt (10 rounds)
- JWT access token (15 min expiry) + refresh token (7 days) generated
- Tokens stored in localStorage on frontend

### 2. Protected Routes
- Access token sent in Authorization header: `Bearer {token}`
- Middleware verifies token signature and expiry
- User data attached to request (`req.user`)

### 3. Token Refresh
- When access token expires, frontend gets 401
- Axios interceptor calls `/auth/refresh` with refresh token
- New access + refresh tokens returned
- Original request retried with new token

### 4. Logout
- Tokens cleared from frontend storage
- Optional: Add refresh token blacklist

## 🎯 Booking Logic

### Overlap Prevention

The system uses **database transactions** to prevent double bookings:

```typescript
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
    throw new ConflictError('Room already booked');
  }

  // Create booking (atomic - no race conditions)
  return await tx.booking.create({ /* ... */ });
});
```

### Date Range Overlap Formula
```
Overlap exists if: (start1 < end2) AND (end1 > start2)
```

### Booking Statuses
- **AVAILABLE**: Room is available
- **PENDING**: Booking created, awaiting confirmation
- **BOOKED**: Confirmed booking
- **CANCELED**: Booking canceled (released for rebooking)

## 🛡️ Security Features

### 1. Rate Limiting
- **General API**: 100 requests per 15 minutes
- **Auth Endpoints**: 5 attempts per 15 minutes (prevents brute force)
- **Booking Creation**: 3 bookings per minute (prevents spam)

### 2. Input Validation
- All inputs validated with Zod schemas
- Type-safe data transformation
- Automatic error messages

### 3. Password Security
- bcrypt hashing (10 salt rounds)
- Never stored or transmitted in plain text

### 4. JWT Security
- Separate access/refresh tokens
- Short-lived access tokens (15 min)
- Longer-lived refresh tokens (7 days)

### 5. Request Logging
- Logs method, URL, status code, duration
- Helps detect suspicious patterns

## 🧪 Running Tests

```bash
# Run test suite
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- booking.service.test.ts
```

## 🚀 Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 📊 Database Schema

```prisma
model User {
  id        String   @id @default(uuid())
  name      String
  email     String   @unique
  password  String
  role      UserRole @default(USER)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  bookings  Booking[]
}

model Hotel {
  id    String @id @default(uuid())
  name  String
  rooms Room[]
}

model Room {
  id            String   @id @default(uuid())
  name          String
  pricePerNight Decimal  @db.Decimal(10,2)
  hotelId       String
  hotel         Hotel    @relation(fields: [hotelId])
  bookings      Booking[]
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model Booking {
  id            String        @id @default(uuid())
  userId        String
  roomId        String
  bookingStatus BookingStatus @default(PENDING)
  startDate     DateTime
  endDate       DateTime
  createdAt     DateTime      @default(now())
  user          User          @relation(fields: [userId])
  room          Room          @relation(fields: [roomId])
}
```

## 🔧 Troubleshooting

### Database Connection Issues
```bash
# Verify MySQL is running
mysql -u root -p -e "SHOW DATABASES;"

# Check DATABASE_URL format
DATABASE_URL=mysql://user:password@localhost:3306/room_booking
```

### Port Already in Use
```bash
# Change PORT in .env
PORT=5001
```

### Prisma Errors
```bash
# Regenerate Prisma client
npm run prisma:generate

# Reset database (WARNING: deletes all data)
npx prisma migrate reset
```

## 📝 License

ISC