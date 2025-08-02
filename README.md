# PlayDesk Services

**PlayDesk Services** is a scalable and modular Game Lounge Management and Booking System backend designed for both customers and game lounge owners. Previously branded as **SaloGame**, the project has now evolved into a TypeScript-based Node.js service with a modular architecture, offering better maintainability and scalability.

---

## 🧩 Overview

PlayDesk enables:

- Customers to view available gaming machines and book time slots.
- Admins and lounge owners to manage bookings, machine inventory, events, and user access levels.

> Note: This project was formerly called **SaloGame** and has now been **rebranded as PlayDesk**. It no longer uses **Konva.js**.

---

## 🚀 Features

- Customer booking portal with real-time availability
- Admin dashboard for managing game lounges
- Role-based user access (Customer, Manager, Owner)
- Game machine management
- Booking management with calendar support
- Event and promotion scheduling
- Microservices for each core domain
- Shared packages for types and utilities
- Containerized environment using Docker

---

## 🏗️ Architecture

- **Modular Backend Service** with distinct modules for core domains (users, bookings, lounges, machines)
- **Express.js** REST API with TypeScript
- **Prisma ORM** for PostgreSQL database management
- **Firebase Authentication** for secure user management
- **Modular structure** with dedicated controllers, services, routes, and models per feature

---

## 🛠 Tech Stack

| Layer    | Technology              |
| -------- | ----------------------- |
| Backend  | Node.js + Express.js    |
| Language | TypeScript              |
| Database | PostgreSQL + Prisma ORM |
| Auth     | Firebase Authentication |
| API      | RESTful API             |
| Package  | pnpm                    |

---

## 📁 Project Structure

```plaintext
/PlayDesk-Services
├── services/                  # Main backend service
│   ├── src/                  # Source code
│   │   ├── app.ts           # Express application setup
│   │   ├── server.ts        # Server entry point
│   │   ├── config/          # Configuration files
│   │   │   ├── db.ts        # Database connection
│   │   │   └── firebase.ts  # Firebase setup
│   │   ├── middlewares/     # Express middlewares
│   │   │   ├── authGuard.ts # Authentication middleware
│   │   │   └── errorHandler.ts # Error handling
│   │   ├── modules/         # Feature modules
│   │   │   ├── user/        # User management (active)
│   │   │   │   ├── controllers/
│   │   │   │   ├── models/
│   │   │   │   ├── routes/
│   │   │   │   ├── services/
│   │   │   │   └── types/
│   │   │   ├── booking/     # Booking system (planned)
│   │   │   ├── lounge/      # Lounge management (planned)
│   │   │   └── machine/     # Machine management (planned)
│   │   ├── seeds/           # Database seeding
│   │   └── utils/           # Utility functions
│   ├── prisma/              # Database management
│   │   ├── schema.prisma    # Database schema
│   │   ├── base.prisma      # Base schema configuration
│   │   ├── models/          # Prisma models
│   │   ├── enums/           # Database enums
│   │   └── migrations/      # Database migrations
│   ├── generated/           # Auto-generated Prisma client
│   ├── package.json         # Dependencies and scripts
│   ├── tsconfig.json        # TypeScript configuration
│   └── README.md            # Service-specific documentation
└── README.md                # This file - project overview
```

## ⚙️ Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/Imadh-Ifham/PlayDesk-Services.git
cd PlayDesk-Services
```

### 2. Navigate to Services Directory

```bash
cd services
```

### 3. Install Dependencies

```bash
pnpm install
```

> Make sure pnpm is installed globally (`npm i -g pnpm`)

### 4. Setup Environment Variables

Create a `.env` file in the services directory:

```bash
cp .env.example .env
```

Configure the following environment variables:

- Database connection URL
- Firebase service account credentials
- Server port and other configurations

### 5. Setup Database

Generate Prisma client and run migrations:

```bash
pnpm prisma:generate
pnpm prisma migrate dev
```

### 6. Seed Database (Optional)

Populate the database with initial data:

```bash
pnpm seed
```

### 7. Run the Service

Start the development server:

```bash
pnpm dev
```

The API will be available at `http://localhost:3000` (or your configured port).

## 📖 Module Documentation

Each module has its own detailed documentation:

- **User Module**: See `services/src/modules/user/README.md` (when available)
- **Booking Module**: See `services/src/modules/booking/README.md` (when available)
- **Lounge Module**: See `services/src/modules/lounge/README.md` (when available)
- **Machine Module**: See below and `services/src/modules/machine/README.md` (when available)

### Machine Module Updates (August 2025)

The Machine module has been updated with new models and TypeScript interfaces for managing gaming equipment in lounges. Key components:

#### 1. Prisma Schema (`services/prisma/models/machine.prisma`)

- **MachineType Model**

  - Core fields: id, name, specifications, description, imageUrl
  - Lounge association through loungeId
  - Relations to Machine model
  - Timestamps for creation and updates

- **Machine Model**
  - Unique identifier and serial number tracking
  - Category enum: Console, PC_L, PC_R
  - Status tracking (online/offline)
  - Relations to MachineType and Lounge
  - Full timestamp support

#### 2. TypeScript Models

**Machine Model** (`src/modules/machine/models/machine.model.ts`)

- Interface for machine data with relations
- Enums for machine block types and status
- Type definitions for create/update operations
- Prisma query include helpers

**MachineType Model** (`src/modules/machine/models/machineType.model.ts`)

- Complete interface for machine types
- Support for optional specifications and descriptions
- Lounge relationship handling
- Create/Update operation types

**Rate Management** (`src/modules/machine/models/rateByPlayers.model.ts`)

- Reserved for future implementation
- Will handle machine pricing based on player count
- Support for flexible rate structures

For detailed service documentation, refer to `services/README.md`.

## 🔧 Available Scripts

When working in the `services/` directory:

| Script                  | Description                              |
| ----------------------- | ---------------------------------------- |
| `pnpm dev`              | Start development server with hot reload |
| `pnpm build`            | Build the application for production     |
| `pnpm start`            | Start the production server              |
| `pnpm prisma:generate`  | Generate Prisma client                   |
| `pnpm prisma:merge`     | Merge Prisma schema files                |
| `pnpm seed`             | Seed database with initial data          |
| `pnpm seed:permissions` | Seed permission data                     |

## 🌐 API Documentation

The API provides RESTful endpoints for:

- **User Management**: Authentication, profiles, roles, and permissions
- **Booking System**: Time slot management and reservations (in development)
- **Lounge Management**: Venue and facility management (in development)
- **Machine Management**: Gaming equipment inventory (in development)

Detailed API documentation will be available at `/api/docs` when the service is running (if implemented).

---

## 👨‍💻 Project Owner

PlayDesk is engineered and owned by Imadh Ifham and team.
Originally developed under the name SaloGame, it has been rebranded and restructured for scalability and performance under the new brand.
