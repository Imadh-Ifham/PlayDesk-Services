# PlayDesk Services

This directory contains the backend services for the PlayDesk application, a TypeScript-based Node.js API server with PostgreSQL database integration and Firebase authentication.

## 🏗️ Architecture Overview

The services layer is built using a modular architecture with the following key components:

- **Express.js** - Web framework for building RESTful APIs
- **Prisma** - Database ORM for PostgreSQL integration
- **Firebase Admin SDK** - Authentication and authorization
- **TypeScript** - Type-safe JavaScript development

## 📁 Directory Structure

```
services/
├── src/                          # Source code
│   ├── app.ts                   # Express application setup
│   ├── server.ts                # Server entry point
│   ├── config/                  # Configuration files
│   │   ├── db.ts               # Database connection setup
│   │   └── firebase.ts         # Firebase initialization
│   ├── middlewares/            # Express middlewares
│   │   ├── authGuard.ts        # JWT token verification
│   │   └── errorHandler.ts     # Global error handling
│   ├── modules/                # Feature modules (currently empty)
│   │   ├── user/               # User management
│   │   ├── booking/            # Booking system
│   │   ├── lounge/             # Lounge management
│   │   └── machine/            # Machine management
│   └── utils/                  # Utility functions
├── prisma/                     # Database schema and migrations
│   └── schema.prisma          # Prisma schema definition
├── generated/                  # Auto-generated Prisma client
├── package.json               # Node.js dependencies
└── tsconfig.json             # TypeScript configuration
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- pnpm package manager
- PostgreSQL database
- Firebase project with service account

### Environment Setup

1. Create a `.env` file in the services directory with the following variables:

   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/playdesk"
   PORT=3000
   FIREBASE_SERVICE_ACCOUNT='{...}' # Firebase service account JSON
   ```

2. Alternatively, create a `firebase-service-account.json` file in the services directory.

### Installation & Development

```bash
# Install dependencies
pnpm install

# Generate Prisma client
pnpm prisma generate

# Run database migrations
pnpm prisma migrate dev

# Start development server
pnpm run dev
```

### Production

```bash
# Build the application
pnpm run build

# Start production server
pnpm start
```

## 🔧 Core Components

### Database Configuration (`src/config/db.ts`)

- Initializes Prisma client connection to PostgreSQL
- Handles database connection errors
- Exports prisma instance for use across the application

### Firebase Configuration (`src/config/firebase.ts`)

- Initializes Firebase Admin SDK
- Supports both environment variable and file-based service account configuration
- Provides Firebase admin instance for authentication operations

### Authentication Middleware (`src/middlewares/authGuard.ts`)

- Verifies Firebase JWT tokens from Authorization headers
- Protects API routes requiring authentication
- Adds decoded user information to request object
- Returns 401 for invalid or missing tokens

### Error Handling (`src/middlewares/errorHandler.ts`)

- Global error handler for Express application
- Logs errors and returns appropriate HTTP status codes
- Provides consistent error response format

### Application Setup (`src/app.ts`)

- Configures Express application with security middleware:
  - **Helmet** - Security headers
  - **CORS** - Cross-origin resource sharing
  - **Morgan** - HTTP request logging
- Sets up route structure (currently commented out)
- Applies authentication guard to protected routes

### Server Entry Point (`src/server.ts`)

- Initializes database connection
- Initializes Firebase configuration
- Starts Express server on specified port
- Handles startup errors gracefully

## 🗄️ Database Schema

The application uses Prisma as the ORM with PostgreSQL. The schema is defined in `prisma/schema.prisma` and generates a client in the `generated/prisma` directory.

### Key Features:

- Type-safe database queries
- Automatic migration generation
- Custom output directory for generated client

## 🔐 Authentication Flow

1. Client sends request with `Authorization: Bearer <token>` header
2. `authGuard` middleware extracts and verifies the JWT token using Firebase Admin SDK
3. On success, decoded user information is added to the request object
4. On failure, middleware returns 401 Unauthorized response

## 📦 Dependencies

### Production Dependencies

- `express` - Web framework
- `@prisma/client` - Database client
- `firebase-admin` - Firebase authentication
- `cors` - CORS middleware
- `helmet` - Security middleware
- `morgan` - HTTP logging
- `dotenv` - Environment variable loading

### Development Dependencies

- `typescript` - TypeScript compiler
- `ts-node` - TypeScript execution
- `nodemon` - Development server
- `prisma` - Database toolkit
- Various type definitions

## 🔄 Available Scripts

- `pnpm run dev` - Start development server with hot reload
- `pnpm run build` - Compile TypeScript to JavaScript
- `pnpm start` - Start production server from compiled code

## 🚧 Development Status

The service architecture is set up but the following modules are currently empty and awaiting implementation:

- **User Module** - User management and profiles
- **Booking Module** - Reservation system
- **Lounge Module** - Lounge management
- **Machine Module** - Equipment management
- **Gateway Service** - API gateway functionality

## 📝 Next Steps

1. Implement the modular route handlers in `src/modules/`
2. Define complete database schema in `prisma/schema.prisma`
3. Set up database migrations
4. Complete the API gateway service
5. Add comprehensive testing
6. Implement logging and monitoring
7. Add API documentation (OpenAPI/Swagger)

## 🤝 Contributing

When adding new modules:

1. Create a new directory under `src/modules/`
2. Implement route handlers, controllers, and services
3. Add appropriate tests
4. Update this README with new functionality
5. Uncomment and configure routes in `src/app.ts`
