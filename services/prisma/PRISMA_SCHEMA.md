# PlayDesk Services - Prisma Database Schema Documentation

This document provides a comprehensive overview of the PlayDesk Services database schema, including all models, relationships, and business logic.

## Table of Contents

- [PlayDesk Services - Prisma Database Schema Documentation](#playdesk-services---prisma-database-schema-documentation)
  - [Table of Contents](#table-of-contents)
  - [Overview](#overview)
  - [Database Architecture](#database-architecture)
  - [Core Models](#core-models)
    - [PDAccount (Main Account Model)](#pdaccount-main-account-model)
    - [Lounge (Gaming Lounge Model)](#lounge-gaming-lounge-model)
    - [Service \& LoungeService (Modular Services)](#service--loungeservice-modular-services)
    - [User (Lounge Users)](#user-lounge-users)
    - [Role \& Permission (RBAC System)](#role--permission-rbac-system)
  - [Enums](#enums)
    - [AccountStatus](#accountstatus)
    - [LoungeStatus](#loungestatus)
    - [UserStatus](#userstatus)
  - [Relationships \& Business Logic](#relationships--business-logic)
    - [Multi-Tenancy Pattern](#multi-tenancy-pattern)
    - [Data Isolation](#data-isolation)
    - [Cascade Behaviors](#cascade-behaviors)
  - [Database Configuration](#database-configuration)
    - [Base Configuration (`base.prisma`)](#base-configuration-baseprisma)
    - [Performance Considerations](#performance-considerations)
  - [Schema Management](#schema-management)
    - [Modular Structure](#modular-structure)
    - [Build Process](#build-process)
    - [Migration Strategy](#migration-strategy)
  - [Data Seeding](#data-seeding)
    - [Permissions (`permission.seed.ts`)](#permissions-permissionseedts)
    - [Roles (`role.seed.ts`)](#roles-roleseedts)
    - [Usage Example](#usage-example)
  - [Security Features](#security-features)
  - [Scalability Considerations](#scalability-considerations)

## Overview

The PlayDesk Services database is designed as a **multi-tenant SaaS platform** for gaming lounge management. The architecture supports:

- **Account-based multi-tenancy**: Each PDAccount can own multiple lounges
- **Modular service system**: Lounges can enable/disable specific features
- **Role-based access control (RBAC)**: Granular permissions for different user types
- **Scalable architecture**: Designed to handle multiple gaming lounges per account

## Database Architecture

```
┌─────────────────┐
│   PDAccount     │ ← Main tenant/account
│   (Business)    │
└─────┬───────────┘
      │ 1:N
      ▼
┌─────────────────┐
│     Lounge      │ ← Individual gaming lounges
│   (Location)    │
└─────┬───────────┘
      │ M:N
      ▼
┌─────────────────┐     ┌─────────────────┐
│    Service      │ ←─→ │ LoungeService   │ ← Feature modules
│  (Features)     │     │  (Junction)     │
└─────────────────┘     └─────────────────┘

      ┌─────────────────┐
      │      User       │ ← Lounge users
      │   (Staff/etc)   │
      └─────┬───────────┘
            │ N:1
            ▼
      ┌─────────────────┐     ┌─────────────────┐
      │      Role       │ ←─→ │ RolePermission  │
      │  (User Types)   │     │   (Junction)    │
      └─────────────────┘     └─────┬───────────┘
                                    │ N:1
                                    ▼
                              ┌─────────────────┐
                              │   Permission    │
                              │ (Capabilities)  │
                              └─────────────────┘
```

## Core Models

### PDAccount (Main Account Model)

**Purpose**: Represents the top-level business account that owns one or more gaming lounges.

```prisma
model PDAccount {
  id         String         @id @default(uuid())
  name       String                                          // Business name
  email      String         @unique                          // Contact email
  phone      String                                          // Contact phone
  status     AccountStatus  @default(ACTIVE)                 // Account status
  logoUrl    String?        @map("logo_url")                 // Optional logo
  createdAt  DateTime       @default(now()) @map("created_at")
  updatedAt  DateTime       @updatedAt @map("updated_at")

  lounges    Lounge[]                                       // Owned lounges

  @@map("pd_accounts")
}
```

**Key Features:**

- **Unique email constraint**: Ensures one account per email address
- **Account status management**: ACTIVE, SUSPENDED, TRIALING
- **Business branding**: Optional logo URL for white-labeling
- **Audit trails**: Created/updated timestamps
- **One-to-many relationship**: Can own multiple lounges

**Business Logic:**

- Acts as the main tenant in the multi-tenant architecture
- Billing and subscription management happens at this level
- All lounges under an account share the same billing/subscription

### Lounge (Gaming Lounge Model)

**Purpose**: Represents individual gaming lounge locations owned by a PDAccount.

```prisma
model Lounge {
  id              String        @id @default(uuid())
  pdAccountId     String        @map("pd_account_id")         // FK to PDAccount
  pdAccount       PDAccount     @relation(fields: [pdAccountId], references: [id], onDelete: Cascade)

  name            String                                     // Lounge name
  location        String?                                    // Address/location
  latitude        Float?                                     // GPS coordinates
  longitude       Float?                                     // GPS coordinates
  logoUrl         String?        @map("logo_url")            // Lounge-specific logo
  status          LoungeStatus   @default(ACTIVE)            // Lounge status
  createdAt       DateTime       @default(now()) @map("created_at")
  updatedAt       DateTime       @updatedAt     @map("updated_at")

  loungeServices  LoungeService[]                           // Enabled services
  users           User[]                                    // Lounge staff/users
  roles           Role[]                                    // Lounge-specific roles

  @@map("lounges")
}
```

**Key Features:**

- **Hierarchical ownership**: Belongs to a PDAccount
- **Location services**: GPS coordinates for mapping
- **Status management**: ACTIVE, CLOSED, PENDING_APPROVAL
- **Cascade deletion**: If PDAccount is deleted, lounges are deleted
- **Service modularity**: Can enable/disable specific features
- **Independent branding**: Each lounge can have its own logo

**Business Logic:**

- Each lounge operates independently with its own users and roles
- Services can be enabled/disabled per lounge
- Location data enables map-based features and multi-location management

### Service & LoungeService (Modular Services)

**Purpose**: Implements a modular service system where lounges can enable/disable specific features.

```prisma
model Service {
  id                String   @id @default(uuid())
  key               String   @unique                          // Unique identifier
  name              String                                   // Display name
  description       String?                                  // Feature description
  iconUrl           String?  @map("icon_url")                // UI icon
  enabledByDefault  Boolean  @default(false) @map("enabled_by_default")
  isCoreService     Boolean  @default(false) @map("is_core_service")
  createdAt         DateTime @default(now()) @map("created_at")
  updatedAt         DateTime @updatedAt @map("updated_at")

  loungeServices  LoungeService[]

  @@map("services")
}

model LoungeService {
  loungeId   String   @map("lounge_id")                     // FK to Lounge
  serviceId  String   @map("service_id")                    // FK to Service
  enabled    Boolean  @default(true)                        // Service enabled?

  lounge     Lounge   @relation(fields: [loungeId], references: [id], onDelete: Cascade)
  service    Service  @relation(fields: [serviceId], references: [id], onDelete: Cascade)

  @@id([loungeId, serviceId])                               // Composite PK
  @@map("lounge_services")
}
```

**Key Features:**

- **Modular architecture**: Features can be enabled/disabled per lounge
- **Core vs optional services**: Some services are mandatory
- **Default enablement**: New lounges can auto-enable certain services
- **UI integration**: Icons and descriptions for frontend display
- **Many-to-many relationship**: Lounges ↔ Services via junction table

**Service Examples:**

- `booking` - Gaming station reservations
- `cafe` - Food and beverage management
- `inventory` - Gaming equipment tracking
- `tournaments` - Competition management
- `loyalty` - Customer reward programs

### User (Lounge Users)

**Purpose**: Represents users within a specific lounge (staff, managers, etc.).

```prisma
model User {
  id        String     @id @default(cuid())
  username  String                                          // Login username
  password  String                                          // Hashed password
  email     String?    @unique                              // Optional email
  status    UserStatus @default(ACTIVE)                     // User status
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt

  loungeId  String                                          // FK to Lounge
  roleId    String                                          // FK to Role

  lounge    Lounge     @relation(fields: [loungeId], references: [id])
  role      Role       @relation(fields: [roleId], references: [id])

  @@unique([username, loungeId])                            // Username unique per lounge
  @@map("users")
}
```

**Key Features:**

- **Lounge-scoped users**: Users belong to specific lounges
- **Unique username per lounge**: Same username can exist in different lounges
- **Role-based access**: Each user has exactly one role
- **Status management**: ACTIVE, SUSPENDED, DELETED
- **Optional email**: Email is not required but must be unique if provided

**Business Logic:**

- Users are scoped to lounges, not global to the PDAccount
- This allows different lounges to have independent user management
- Role determines what actions a user can perform

### Role & Permission (RBAC System)

**Purpose**: Implements Role-Based Access Control with granular permissions.

```prisma
model Role {
  id        String   @id @default(cuid())
  name      String                                          // Role name
  isDefault Boolean  @default(false)                        // System default role?
  loungeId  String                                          // FK to Lounge

  users       User[]                                        // Users with this role
  permissions RolePermission[]                              // Role permissions

  @@unique([name, loungeId])                                // Role name unique per lounge
}

model Permission {
  id          String   @id @default(cuid())
  key         String   @unique                              // Permission key
  description String                                        // Human-readable description

  roles       RolePermission[]                              // Roles with this permission
}

model RolePermission {
  roleId       String
  permissionId String

  role         Role       @relation(fields: [roleId], references: [id])
  permission   Permission @relation(fields: [permissionId], references: [id])

  @@id([roleId, permissionId])                              // Composite PK
}
```

**Key Features:**

- **Lounge-scoped roles**: Roles are specific to each lounge
- **Global permissions**: Permissions are shared across all lounges
- **Default roles**: System can create standard roles automatically
- **Many-to-many relationship**: Roles ↔ Permissions via junction table
- **Granular control**: Fine-grained permission system

**Default Roles:**

- **Admin**: Full system access (32 permissions)
- **Manager**: Operational control (15 permissions)
- **Employee**: Staff operations (8 permissions)
- **Customer**: User access (6 permissions)
- **Guest**: Limited read-only (3 permissions)

**Permission Categories:**

- `user.*` - User management permissions
- `role.*` - Role management permissions
- `permission.*` - Permission management permissions
- `lounge.*` - Lounge management permissions
- `booking.*` - Booking system permissions
- `machine.*` - Gaming machine management
- `system.*` - System administration

## Enums

### AccountStatus

```prisma
enum AccountStatus {
  ACTIVE     // Fully operational account
  SUSPENDED  // Temporarily disabled
  TRIALING   // Trial period active
}
```

### LoungeStatus

```prisma
enum LoungeStatus {
  ACTIVE             // Operating normally
  CLOSED             // Temporarily closed
  PENDING_APPROVAL   // Awaiting approval
}
```

### UserStatus

```prisma
enum UserStatus {
  ACTIVE     // Can log in and use system
  SUSPENDED  // Temporarily disabled
  DELETED    // Soft deleted
}
```

## Relationships & Business Logic

### Multi-Tenancy Pattern

```
PDAccount (Tenant)
├── Lounge 1
│   ├── Users (Admin, Staff, etc.)
│   ├── Roles (Admin, Manager, Employee)
│   └── Services (Booking, Cafe, etc.)
├── Lounge 2
│   ├── Users (Different set)
│   ├── Roles (Same names, different permissions)
│   └── Services (Different enabled services)
└── Lounge N...
```

### Data Isolation

- **Account Level**: PDAccounts are completely isolated
- **Lounge Level**: Lounges share account but have separate users/roles
- **Global Level**: Services and Permissions are shared across all tenants

### Cascade Behaviors

- **PDAccount deletion** → All lounges deleted
- **Lounge deletion** → All users, roles, and service assignments deleted
- **Service deletion** → All lounge service assignments deleted
- **Role deletion** → Users must be reassigned to different roles

## Database Configuration

### Base Configuration (`base.prisma`)

```prisma
generator client {
  provider = "prisma-client-js"
  output   = "../generated/prisma"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

**Key Settings:**

- **Database**: PostgreSQL (production-ready, ACID compliant)
- **Client Generation**: Custom output directory for organized imports
- **Environment**: Database URL from environment variables

### Performance Considerations

- **Indexes**: Unique constraints create automatic indexes
- **Foreign Keys**: All relationships have proper FK constraints
- **Composite Keys**: Junction tables use composite primary keys
- **UUIDs**: Most models use UUIDs for distributed system compatibility

## Schema Management

### Modular Structure

```
prisma/
├── base.prisma           # Database configuration
├── schema.prisma         # Generated merged schema
├── models/               # Individual model files
│   ├── account.prisma
│   ├── lounge.prisma
│   ├── service.prisma
│   ├── loungeService.prisma
│   ├── user.prisma
│   ├── role.prisma
│   └── permission.prisma
└── enums/                # Enum definitions
    ├── accountStatus.prisma
    ├── loungeStatus.prisma
    └── userStatus.prisma
```

### Build Process

```bash
# Merge all prisma files into single schema
pnpm prisma:merge

# Generate Prisma client
pnpm prisma:generate

# Create and apply migrations
npx prisma migrate dev
```

### Migration Strategy

- **Development**: Use `prisma migrate dev` for automatic migrations
- **Production**: Use `prisma migrate deploy` for controlled deployments
- **Schema changes**: Modify individual model files, then merge and migrate

## Data Seeding

The system includes comprehensive seeding for:

### Permissions (`permission.seed.ts`)

- Creates 27 default permissions across 6 categories
- Covers all major system operations
- Supports granular access control

### Roles (`role.seed.ts`)

- Creates 5 default roles per lounge
- Assigns appropriate permissions to each role
- Supports both system and custom roles

### Usage Example

```bash
# Seed permissions first
pnpm seed:permissions

# Then seed roles (depends on permissions)
pnpm seed:roles

# Or seed everything
pnpm seed:all
```

## Security Features

1. **Multi-tenant Isolation**: Data is properly scoped to prevent cross-tenant access
2. **Role-Based Access Control**: Granular permissions for different user types
3. **Cascade Deletion Protection**: Prevents orphaned records
4. **Unique Constraints**: Prevents duplicate emails, usernames per lounge
5. **Status Management**: Soft deletion and suspension capabilities
6. **Audit Trails**: Created/updated timestamps on all models

## Scalability Considerations

1. **Horizontal Scaling**: UUID primary keys support distributed systems
2. **Service Modularity**: Features can be enabled/disabled per lounge
3. **Tenant Isolation**: Each PDAccount operates independently
4. **Efficient Relationships**: Proper indexing and foreign key constraints
5. **Flexible Permissions**: Role system can adapt to different business needs

---

_This schema supports a complete multi-tenant gaming lounge management platform with modular services, robust user management, and flexible access control._
