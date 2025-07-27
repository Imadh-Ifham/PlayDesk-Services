# Role Seeding Guide

This guide explains how to seed default roles with their associated permissions in the PlayDesk Services application.

## Overview

The role seeding system creates 5 default roles for each lounge:

1. **Admin** - Full system access with all permissions
2. **Manager** - Operational control with most permissions
3. **Employee** - Staff access with basic operational permissions
4. **Customer** - Regular customer with booking and profile access
5. **Guest** - Limited read-only access

## Default Role Permissions

### 🔧 Admin (Super User)

- **Full System Access**: `SYSTEM_ADMIN`, `SYSTEM_CONFIG`
- **User Management**: All user CRUD operations
- **Role Management**: All role CRUD operations
- **Permission Management**: All permission CRUD operations
- **Lounge Management**: All lounge operations
- **Booking Management**: All booking operations
- **Machine Management**: All machine operations

### 👔 Manager (Lounge Manager)

- **User Management**: Create, read, update (no delete)
- **Role Access**: Read-only access to roles
- **Lounge Management**: Read and update lounge settings
- **Booking Management**: Full booking control
- **Machine Management**: Create, read, update (no delete)

### 👤 Employee (Staff Member)

- **User Management**: Read-only access
- **Lounge Access**: Read-only access
- **Booking Management**: Create, read, update bookings
- **Machine Management**: Read and update machines

### 🛒 Customer (Regular User)

- **Profile Management**: Read own profile
- **Lounge Information**: View lounge details
- **Booking Management**: Full control of own bookings
- **Machine Access**: View machine availability

### 👁️ Guest (Limited Access)

- **Information Access**: View lounge and machine information
- **Booking Access**: Read-only booking information

## Usage

### 1. Seed Roles for All Existing Lounges

```bash
# Run the role seeding for all lounges
npm run seed:roles

# Or using Node directly
node dist/seeds/role.seed.js
```

### 2. Create Sample Lounge with Roles

```bash
# Creates a sample lounge and default roles
npm run seed:roles sample
```

### 3. Create Roles for Specific Lounge

```typescript
import { createDefaultRolesForLounge } from "./seeds/role.seed";

// Create roles for a specific lounge
await createDefaultRolesForLounge("YOUR_LOUNGE_ID");
```

### 4. View Role Summary

```bash
# Show all roles across all lounges
npm run seed:roles summary

# Show existing lounges
npm run seed:roles lounges
```

### 5. Full Test Run

```bash
# Run comprehensive role seeding test
npm run seed:roles test
```

## Files Structure

```
src/seeds/
├── role.seed.ts      # Main role seeding functions
├── role.test.ts      # Testing and utility scripts
├── permission.seed.ts # Permission seeding (dependency)
└── index.ts          # Main seeding orchestrator
```

## API Functions

### `seedDefaultRoles()`

Seeds default roles for all existing lounges.

### `createDefaultRolesForLounge(loungeId: string)`

Creates default roles for a specific lounge.

### `createSampleLoungeWithRoles()`

Creates a sample lounge ("SAMPLE01") with default roles for testing.

### `getRoleSummary(loungeId?: string)`

Displays a summary of roles and their statistics.

## Database Requirements

Before running role seeding:

1. **Permissions must exist** - Run permission seeding first
2. **Lounges must exist** - Create at least one lounge
3. **Database must be migrated** - Run Prisma migrations

## Example Workflow

```bash
# 1. Run database migrations
npx prisma migrate dev

# 2. Seed permissions first
npm run seed:permissions

# 3. Create a lounge (or use existing)
# ... create lounge via API or directly in DB

# 4. Seed roles
npm run seed:roles

# 5. View results
npm run seed:roles summary
```

## Troubleshooting

### No lounges found

```
⚠️ No lounges found. Please create lounges first before seeding roles.
```

**Solution**: Create at least one lounge before seeding roles.

### Permission not found errors

```
❌ Error creating role 'admin': Permission not found
```

**Solution**: Run permission seeding first: `npm run seed:permissions`

### Role already exists

```
⚠️ Role 'admin' already exists for lounge SAMPLE01, skipping...
```

**This is normal** - The seeding process safely skips existing roles.

## Integration with Main Seeding

The role seeding is integrated into the main seeding process:

```typescript
// src/seeds/index.ts
async function main() {
  await seedPermissions(); // First: Create permissions
  await seedDefaultRoles(); // Second: Create roles with permissions
}
```

Run the complete seeding process:

```bash
npm run seed
```

This ensures proper dependency order and creates a complete, functional role-based access control system.
