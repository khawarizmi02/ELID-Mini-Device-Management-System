# Backend Architecture & Refactoring Summary

## Overview

The backend has been refactored from a monolithic `index.ts` to a clean, layered architecture following RESTful best practices and SOLID principles.

## Folder Structure

```
backend/
├── src/
│   ├── app.ts                          # Express app factory & configuration
│   ├── constants.ts                    # Device types, usernames, event types
│   ├── handlers.ts                     # HTTP request handlers (Controllers)
│   ├── services.ts                     # Business logic layer
│   ├── routes.ts                       # Route factories
│   ├── utils.ts                        # Helper functions & logger
│   └── repositories/
│       └── index.ts                    # Data access layer (Repositories)
├── prisma/
│   ├── schema.prisma                   # Database schema definition
│   └── migrations/                     # Database migration history
├── index.ts                            # Application entry point
├── Dockerfile                          # Container image definition
├── .env.local                          # Environment variables (local)
├── .dockerignore                       # Files to exclude from Docker build
├── package.json                        # Dependencies & scripts
└── README.md                           # API documentation
```

## Architecture Layers

### 1. **Entry Point** (`index.ts`)
- Minimal responsibility: loads the app and starts the server
- Passes control to app factory
- Handles server startup logging

```typescript
import { createApp } from "./src/app";
import { logger } from "./src/utils";

const PORT = process.env.PORT || 3000;
const { app } = createApp();

app.listen(PORT, () => {
  logger.info(`✅ Backend server is running on http://localhost:${PORT}`);
});
```

### 2. **Application Factory** (`src/app.ts`)
- Initializes Express app
- Registers middleware (CORS, JSON parser)
- Instantiates all dependencies
- Registers routes
- Sets up error handling
- Configures graceful shutdown

**Dependencies Management:**
```
PrismaClient (Database)
    ↓
Repositories (Data Access)
    ↓
Services (Business Logic)
    ↓
Handlers (HTTP Controllers)
    ↓
Routes (Express Routes)
```

### 3. **Repository Layer** (`src/repositories/index.ts`)

**Responsibility:** Direct database operations using Prisma

**Classes:**
- `DeviceRepository`
  - `create()` - Create new device
  - `findAll()` - Get all devices
  - `findById()` - Get device by ID
  - `updateStatus()` - Update device status
  - `delete()` - Delete device

- `TransactionRepository`
  - `create()` - Create transaction
  - `findAll()` - Get all transactions with filtering
  - `findByDeviceId()` - Get transactions for specific device

**Benefits:**
- ✅ Abstraction of database layer
- ✅ Easy to switch databases or ORM
- ✅ Consistent data access patterns
- ✅ Testable in isolation

### 4. **Service Layer** (`src/services.ts`)

**Responsibility:** Business logic and orchestration

**Classes:**
- `DeviceService`
  - Manages device lifecycle (create, activate, deactivate)
  - Orchestrates subprocess management
  - Validates business rules
  - Handles errors gracefully
  - Returns standardized response objects

- `TransactionService`
  - Query and filter transactions
  - Validates pagination parameters
  - Returns standardized response objects

**Key Methods:**
```typescript
DeviceService:
├── createDevice()              // Create & validate
├── getAllDevices()             // Retrieve all
├── getDeviceById()             // Retrieve one
├── activateDevice()            // Activate + start subprocess
├── deactivateDevice()          // Deactivate + stop subprocess
├── startTransactionGeneration()// Subprocess management (private)
├── stopTransactionGeneration() // Subprocess cleanup (private)
├── stopAllProcesses()          // Graceful shutdown
└── getActiveDeviceCount()      // Status checking
```

**Benefits:**
- ✅ Business logic separated from HTTP concerns
- ✅ Reusable in different contexts (API, CLI, Jobs)
- ✅ Easier testing of business rules
- ✅ Single Responsibility Principle

### 5. **Handler Layer** (`src/handlers.ts`)

**Responsibility:** HTTP request/response handling

**Classes:**
- `DeviceHandler`
  - Routes device creation requests
  - Validates HTTP input
  - Formats HTTP responses
  - Sets appropriate status codes

- `TransactionHandler`
  - Routes transaction queries
  - Parses query parameters
  - Formats paginated responses

**Pattern:**
```typescript
async createDevice(req: Request, res: Response) {
  const { name, deviceType, ipAddress } = req.body;
  
  // Validate HTTP input
  if (!name || !deviceType || !ipAddress) {
    res.status(400).json({ error: "Missing fields" });
    return;
  }
  
  // Call service layer
  const result = await this.deviceService.createDevice({...});
  
  // Format HTTP response
  if (!result.success) {
    res.status(400).json({ error: result.error });
    return;
  }
  
  res.status(201).json(result.device);
}
```

**Benefits:**
- ✅ Clean separation of HTTP and business logic
- ✅ Easy to add middleware or authentication
- ✅ Consistent error handling
- ✅ Testable HTTP behavior

### 6. **Routes Layer** (`src/routes.ts`)

**Responsibility:** Route definitions and composition

```typescript
export function createDeviceRoutes(deviceHandler: DeviceHandler): Router {
  const router = Router();
  router.post("/devices", (req, res) => deviceHandler.createDevice(req, res));
  router.get("/devices", (req, res) => deviceHandler.getAllDevices(req, res));
  // ...
  return router;
}
```

**Benefits:**
- ✅ Routes defined in functions (flexible composition)
- ✅ Easy to add or remove routes
- ✅ Middleware can be applied per route

### 7. **Utilities** (`src/utils.ts`)

**Shared Utilities:**
- `getRandomItem()` - Array randomization
- `getRandomInterval()` - Random interval (1-5s)
- `logger` - Structured logging with timestamps

**Logger Usage:**
```typescript
logger.info("Device created", { deviceId });
logger.error("Error creating device", error);
logger.warn("High transaction volume", meta);
logger.debug("Debug info", meta);  // Only if DEBUG=true
```

### 8. **Constants** (`src/constants.ts`)

**Configuration Values:**
- `DEVICE_TYPES` - Valid device type options
- `SAMPLE_USERNAMES` - Pool of random usernames
- `EVENT_TYPES` - Transaction event types
- `TRANSACTION_INTERVAL` - Min/max generation interval

**Benefits:**
- ✅ Centralized configuration
- ✅ Easy to modify without code changes
- ✅ Type-safe constants

### 9. **Database Schema** (`prisma/schema.prisma`)

```prisma
model Device {
  id        String   @id @default(uuid())
  name      String
  deviceType String
  ipAddress String
  status    String   @default("inactive")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  transactions Transaction[]
}

model Transaction {
  id        String   @id @default(uuid())
  deviceId  String
  device    Device   @relation(...)
  username  String
  eventType String
  timestamp DateTime
  payload   Json?
  createdAt DateTime @default(now())
}
```

## Data Flow

### Create Device
```
HTTP Request
    ↓
DeviceHandler.createDevice()
    ↓
Validate input
    ↓
DeviceService.createDevice()
    ↓
Validate business rules
    ↓
DeviceRepository.create()
    ↓
Prisma → PostgreSQL
    ↓
Return result
    ↓
Format HTTP response
    ↓
201 Created
```

### Activate Device & Generate Transactions
```
HTTP Request: POST /devices/:id/activate
    ↓
DeviceHandler.activateDevice()
    ↓
DeviceService.activateDevice()
    ├─→ DeviceRepository.updateStatus() [Mark as active]
    └─→ startTransactionGeneration()
         ├─→ setTimeout() → generateTransaction()
         │    ├─→ TransactionRepository.create()
         │    └─→ Prisma → PostgreSQL
         │
         └─→ setTimeout() → generateTransaction() [1-5s later]
              └─→ [Loop continues...]
    ↓
Return response
    ↓
200 OK
```

## Design Patterns Used

### 1. **Dependency Injection**
- Dependencies passed to constructors
- Enables testing with mocks
- Loose coupling between layers

### 2. **Repository Pattern**
- Abstracts database operations
- Provides consistent interface
- Easy to change implementation

### 3. **Service Layer Pattern**
- Business logic centralization
- Orchestrates repositories
- Handles cross-cutting concerns

### 4. **Factory Pattern**
- `createApp()` function
- `createDeviceRoutes()` functions
- Flexible composition

### 5. **Result Object Pattern**
- Services return `{ success: boolean, data?, error? }`
- Handlers check success before responding
- Type-safe error handling

## SOLID Principles Applied

### Single Responsibility Principle
- Each class has ONE reason to change
- Repositories: Database operations only
- Services: Business logic only
- Handlers: HTTP concerns only

### Open/Closed Principle
- Easy to extend (add new handlers/services)
- Hard to modify existing code
- Routes can be added without changing app.ts

### Liskov Substitution Principle
- Repositories follow consistent interface
- Services follow consistent patterns
- Easy to swap implementations

### Interface Segregation Principle
- Handlers don't depend on unnecessary service methods
- Services only use needed repository methods

### Dependency Inversion Principle
- Layers depend on abstractions (classes)
- Not on concrete implementations
- Easy to test with mocks

## Testing Strategy (Future Enhancement)

```typescript
// Test repositories with mock Prisma client
const mockPrisma = { device: { create: jest.fn() } };
const repo = new DeviceRepository(mockPrisma);

// Test services with mock repositories
const mockDeviceRepo = { create: jest.fn() };
const service = new DeviceService(mockDeviceRepo, mockTxnRepo);

// Test handlers with mock services
const mockService = { createDevice: jest.fn() };
const handler = new DeviceHandler(mockService);
```

## Migration Path (How We Got Here)

1. **Before Refactoring:** Monolithic `index.ts` (357 lines)
   - Mixed concerns: HTTP, DB, business logic
   - Hard to test
   - Hard to extend
   - Difficult to maintain

2. **After Refactoring:** Modular architecture
   - Clear separation of concerns
   - Each file has 40-120 lines
   - Easy to test
   - Easy to extend
   - Self-documenting code

## Key Improvements

| Aspect | Before | After |
|--------|--------|-------|
| Files | 1 monolithic file | 9 focused files |
| Concerns | Mixed | Separated into layers |
| Testability | Difficult | Easy (with mocks) |
| Reusability | Low | High |
| Maintainability | Hard | Easy |
| Type Safety | Partial | Complete |
| Documentation | Minimal | Self-documenting |

## Next Steps

1. ✅ Backend refactored with clean architecture
2. 🔲 Add unit tests for services
3. 🔲 Add integration tests for API endpoints
4. 🔲 Add input validation middleware
5. 🔲 Add authentication/authorization
6. 🔲 Add API documentation with Swagger
7. 🔲 Add request logging middleware
