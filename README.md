# PlayDesk

**PlayDesk** is a scalable and modular Game Lounge Management and Booking System designed for both customers and game lounge owners. Previously branded as **SaloGame**, the project has now evolved into a microservice-based architecture within a monorepo structure, offering better maintainability and scalability.

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

- **Microservices** for core domains like bookings, users, machines, and events
- **Monorepo** to manage all services and apps in a single repository
- **Shared libraries** for common logic, types, and utilities
- **API Gateway** or routing system (planned or existing)
- **Dockerized services** for consistent local development and deployment

---

## 🛠 Tech Stack

| Layer    | Technology             |
| -------- | ---------------------- |
| Frontend | React / Next.js        |
| Backend  | Go / Node.js           |
| Database | PostgreSQL             |
| API Comm | REST or gRPC           |
| Auth     | Firebase Auth / JWT    |
| Monorepo | pnpm / TurboRepo       |
| DevOps   | Docker, `.env` configs |

---

## 📁 Monorepo Structure

```plaintext
/playdesk
├── apps/
│   ├── admin-dashboard/       # Admin frontend app
│   └── customer-portal/       # Customer frontend app
├── services/
│   ├── booking-service/       # Handles booking logic
│   ├── machine-service/       # Manages game machines inventory
│   ├── user-service/          # User authentication and profile management
│   └── event-service/         # Event and promotion management
├── shared/
│   ├── utils/                 # Shared utility functions
│   └── types/                 # Shared types and interfaces
├── infra/                     # Infrastructure configs (Docker, k8s manifests, etc)
└── README.md
```

## ⚙️ Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/playdesk.git
cd playdesk
```

### 2. Install Dependencies

```bash
pnpm install
```

> Make sure pnpm is installed globally (npm i -g pnpm)

### 3. Setup Environment Variables

Each service will have its own .env file.

```bash
cp services/booking-service/.env.example services/booking-service/.env
```

### 4. Run Services

Example:

```bash
cd services/booking-service
pnpm dev
```

---

## 👨‍💻 Project Owner

PlayDesk is engineered and owned by Imadh Ifham and team.
Originally developed under the name SaloGame, it has been rebranded and restructured for scalability and performance under the new brand.
