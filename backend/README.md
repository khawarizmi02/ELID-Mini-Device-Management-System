# Device Management Backend

A production-ready Node.js/Express backend service for managing devices and their transactions, built with clean architecture and RESTful practices.

## Architecture Overview

The backend follows a layered, clean architecture pattern:

```
backend/
├── src/
│   ├── app.ts                 # Express app factory
│   ├── constants.ts           # Configuration constants
│   ├── handlers.ts            # Request handlers (Controllers)
│   ├── services.ts            # Business logic (Services)
│   ├── routes.ts              # Route definitions
│   ├── utils.ts               # Utility functions & logger
│   └── repositories/
│       └── index.ts           # Data access layer (Repositories)
├── prisma/
│   └── schema.prisma          # Database schema
├── migrations/                # Database migrations
├── index.ts                   # Entry point
├── Dockerfile
└── package.json
```

## Key Features

- **Layered Architecture**: Repositories → Services → Handlers → Routes
- **Separation of Concerns**: Each layer has a single responsibility
- **Device Management**: Create, list, activate, and deactivate devices
- **Transaction Generation**: Automatic transaction generation (1-5 seconds intervals)
- **Database Persistence**: PostgreSQL with Prisma ORM
- **Safe Concurrent Operations**: Multiple devices with isolated processes
- **RESTful API**: Clean, well-documented endpoints
- **Comprehensive Logging**: Structured logging throughout the application

## Code Organization

### Repositories (`src/repositories/index.ts`)
- `DeviceRepository`: Database operations for devices
- `TransactionRepository`: Database operations for transactions
- Direct Prisma client usage with type safety

### Services (`src/services.ts`)
- `DeviceService`: Device lifecycle management & process management
- `TransactionService`: Transaction queries and filtering
- Business logic implementation
- Transaction generation subprocess management

### Handlers (`src/handlers.ts`)
- `DeviceHandler`: Device HTTP request handling
- `TransactionHandler`: Transaction HTTP request handling
- Request validation and response formatting

### Routes (`src/routes.ts`)
- Device routes factory function
- Transaction routes factory function
- Route composition

## API Endpoints

### Device Management

#### Create Device
```bash
POST /devices
Content-Type: application/json

{
  "name": "Main Entrance Gate",
  "deviceType": "access_controller",
  "ipAddress": "192.168.1.100"
}

Response: 201 Created
```

#### Get All Devices
```bash
GET /devices
Response: 200 OK
```

#### Get Single Device
```bash
GET /devices/:id
Response: 200 OK
```

#### Activate Device (Start Transaction Generation)
```bash
POST /devices/:id/activate
Response: 200 OK
```

#### Deactivate Device (Stop Transaction Generation)
```bash
POST /devices/:id/deactivate
Response: 200 OK
```

### Transaction Management

#### Get All Transactions
```bash
GET /transactions?limit=100&offset=0&deviceId=<optional>
Response: 200 OK
```

#### Get Device Transactions
```bash
GET /devices/:id/transactions?limit=100&offset=0
Response: 200 OK
```

### Health Check
```bash
GET /health
Response: 200 OK
{
  "status": "ok",
  "timestamp": "2025-12-24T...",
  "activeDevices": 2
}
```

## Setup & Running

### Local Development

```bash
# Install dependencies
bun install

# Set environment variable
export DATABASE_URL="postgresql://postgres:password@localhost:5432/device_control_db"

# Run Prisma migrations (if not already done)
bunx prisma migrate dev

# Start the server
bun run index.ts
```

Server will start on `http://localhost:3000`

### Docker

```bash
# Build and run with docker-compose
docker-compose up -d backend
```

## Environment Variables

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/device_control_db
PORT=3000
DEBUG=false  # Set to true for debug logging
```

## Device Types

- `access_controller` - Access control/entry systems
- `face_reader` - Facial recognition readers
- `anpr` - Automatic Number Plate Recognition systems

## Transaction Generation

When a device is activated:
- Background process starts generating transactions
- Random intervals between 1-5 seconds
- Random usernames from predefined list
- Random event types (access_granted, access_denied, face_match, plate_read, unauthorized_access)
- Safe database writes using Prisma connection pooling
- Process stops immediately on device deactivation
- All processes gracefully shutdown on server termination

## Technologies

- **Express.js 5.x**: HTTP server framework
- **Prisma 5.x**: ORM for database operations
- **PostgreSQL 16**: Relational database
- **TypeScript**: Type safety and better DX
- **Bun**: JavaScript runtime
- **UUID**: Unique identifiers
- **CORS**: Cross-origin resource sharing
