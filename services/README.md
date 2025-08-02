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
│   ├── modules/                # Feature modules
│   │   ├── booking/            # Booking system (empty)
│   │   ├── lounge/             # Lounge management
│   │   │   ├── controllers/    # Lounge controllers
│   │   │   ├── models/         # Lounge data models
│   │   │   ├── routes/         # Lounge route definitions
│   │   │   └── services/       # Lounge business logic
│   │   ├── machine/            # Machine management (empty)
│   │   └── user/               # User management
│   │       ├── controllers/    # User controllers
│   │       ├── models/         # User data models
│   │       ├── routes/         # User route definitions
│   │       └── services/       # User business logic
│   ├── scripts/                # Database and utility scripts
│   ├── seeds/                  # Database seeding files
│   └── utils/                  # Utility functions
├── prisma/                     # Database schema and migrations
│   ├── schema.prisma          # Main Prisma schema
│   ├── base.prisma            # Base configuration
│   ├── enums/                 # Enum definitions
│   └── models/                # Model definitions
├── generated/                  # Auto-generated Prisma client
│   └── prisma/                # Generated Prisma client files
├── package.json               # Node.js dependencies
├── pnpm-lock.yaml            # Package lock file
├── prisma-merge.json         # Prisma merge configuration
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

- **`express`** - Fast, unopinionated web framework for Node.js used to build the REST API
- **`@prisma/client`** - Auto-generated, type-safe database client for database operations
- **`firebase-admin`** - Firebase Admin SDK for server-side authentication and user management
- **`cors`** - Express middleware to enable Cross-Origin Resource Sharing (CORS)
- **`helmet`** - Security middleware that sets various HTTP headers to secure Express apps
- **`morgan`** - HTTP request logger middleware for Express
- **`dotenv`** - Loads environment variables from `.env` file into `process.env`
- **`bcryptjs`** - Library for hashing passwords and sensitive data
- **`@types/bcryptjs`** - TypeScript type definitions for bcryptjs

### Development Dependencies

- **`typescript`** - TypeScript compiler for type-safe JavaScript development
- **`ts-node`** - TypeScript execution environment and REPL for Node.js
- **`nodemon`** - Development utility that automatically restarts the server when file changes are detected
- **`prisma`** - Database toolkit for schema migration, introspection, and client generation
- **`prisma-merge`** - Tool to merge multiple Prisma schema files into a single schema
- **`@types/cors`** - TypeScript type definitions for the cors library
- **`@types/express`** - TypeScript type definitions for Express.js
- **`@types/morgan`** - TypeScript type definitions for the morgan logger
- **`@types/node`** - TypeScript type definitions for Node.js core modules

## 🔄 Available Scripts

### Development Scripts

- **`pnpm run dev`** - Start development server with hot reload using nodemon and ts-node
  ```bash
  pnpm run dev
  ```
  This starts the server in development mode, automatically restarting when you make changes to the code.

### Build Scripts

- **`pnpm run build`** - Compile TypeScript to JavaScript for production

  ```bash
  pnpm run build
  ```

  Compiles all TypeScript files to the `dist/` directory for production deployment.

- **`pnpm start`** - Start production server from compiled JavaScript
  ```bash
  pnpm start
  ```
  Runs the compiled JavaScript from the `dist/` directory. Make sure to run `build` first.

### Database Scripts

- **`pnpm run prisma:merge`** - Merge multiple Prisma schema files into one

  ```bash
  pnpm run prisma:merge
  ```

  Combines all `.prisma` files from the `prisma/` directory into `prisma/schema.prisma`.

- **`pnpm run prisma:generate`** - Merge schemas and generate Prisma client

  ```bash
  pnpm run prisma:generate
  ```

  Runs schema merge first, then generates the Prisma client in the `generated/` directory.

- **`pnpm run migrate`** - Run database migration script with a required migration name

  ```bash
  pnpm run migrate -- --name <migration-name>
  ```

  Executes the custom migration script located at `src/scripts/migrate.ts`. The script requires a `--name` parameter to specify the migration name. This command will:

  1. First run `prisma:generate` to merge schemas and generate the Prisma client
  2. Then run `prisma migrate dev` with the provided migration name

  **Example:**

  ```bash
  pnpm run migrate -- --name add-publicId-non-nullable
  ```

### Seeding Scripts

- **`pnpm run seed`** - Run all database seeds

  ```bash
  pnpm run seed
  ```

  Executes the main seeding script that populates the database with initial data.

- **`pnpm run seed:permissions`** - Seed permissions data only

  ```bash
  pnpm run seed:permissions
  ```

  Populates the database with permission records for role-based access control.

- **`pnpm run seed:roles`** - Seed roles data only

  ```bash
  pnpm run seed:roles
  ```

  Populates the database with role definitions and their associated permissions.

- **`pnpm run seed:roles:test`** - Run role seeding tests
  ```bash
  pnpm run seed:roles:test
  ```
  Executes tests for the role seeding functionality to ensure data integrity.

## 🚧 Development Status

The service architecture is set up with the following module status:

- **User Module** - ✅ Structure implemented (controllers, models, routes, services directories)
- **Lounge Module** - ✅ Structure implemented (controllers, models, routes, services directories)
- **Booking Module** - ⏳ Directory created, awaiting implementation
- **Machine Module** - ⏳ Directory created, awaiting implementation

Additional components:

- **Database Scripts** - ✅ Migration scripts available in `src/scripts/`
- **Database Seeding** - ✅ Seed files available in `src/seeds/`

## 📝 Next Steps

1. Complete implementation of user and lounge module functionality
2. Implement booking and machine module structures and functionality
3. Finalize database schema definitions in `prisma/models/`
4. Set up database migrations and run initial seeding
5. Add comprehensive testing for all modules
6. Implement logging and monitoring
7. Add API documentation (OpenAPI/Swagger)
8. Configure CI/CD pipeline

## 🤝 Contributing

When adding new modules:

1. Create a new directory under `src/modules/`
2. Implement route handlers, controllers, and services
3. Add appropriate tests
4. Update this README with new functionality
5. Uncomment and configure routes in `src/app.ts`
