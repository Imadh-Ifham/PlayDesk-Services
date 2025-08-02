# User Module

The User Module is a comprehensive authentication and authorization system for the PlayDesk Services application. It manages users, roles, and permissions with a flexible role-based access control (RBAC) system.

## Table of Contents

- [User Module](#user-module)
  - [Table of Contents](#table-of-contents)
  - [Overview](#overview)
  - [Architecture](#architecture)
  - [Database Schema](#database-schema)
    - [User Table](#user-table)
    - [Role Table](#role-table)
    - [Permission Table](#permission-table)
    - [RolePermission Table (Junction)](#rolepermission-table-junction)
    - [PDAccount Table](#pdaccount-table)
    - [Lounge Table](#lounge-table)
  - [API Endpoints](#api-endpoints)
    - [Permission Management](#permission-management)
    - [Role Management](#role-management)
    - [User Management](#user-management)
  - [Models](#models)
    - [User Model](#user-model)
    - [Role Model](#role-model)
    - [Permission Model](#permission-model)
  - [Controllers](#controllers)
    - [Permission Controller](#permission-controller)
      - [Get Permissions](#get-permissions)
      - [Create Permission](#create-permission)
    - [Role Controller](#role-controller)
      - [Get Roles](#get-roles)
      - [Create Role](#create-role)
      - [Assign Permission to Role](#assign-permission-to-role)
    - [User Controller](#user-controller)
  - [Services](#services)
    - [User Service](#user-service)
  - [Routes](#routes)
    - [Permission Routes](#permission-routes)
    - [Role Routes](#role-routes)
    - [User Routes](#user-routes)
  - [Usage Examples](#usage-examples)
    - [Creating a Permission](#creating-a-permission)
    - [Checking User Permissions](#checking-user-permissions)
    - [Filtering Permissions](#filtering-permissions)
  - [Validation Rules](#validation-rules)
    - [Permission Keys](#permission-keys)
    - [User Data](#user-data)
    - [Role Data](#role-data)
  - [Security Features](#security-features)

## Overview

The User Module provides:

- **User Management**: Create, read, update, and delete users
- **Role-Based Access Control (RBAC)**: Flexible permission system with roles
- **Permission Management**: Granular permissions for different system operations
- **Multi-tenancy**: Users are scoped to specific accounts with lounge-specific permissions
- **User Status Management**: Active, suspended, and deleted user states
- **Authentication Support**: Password-based authentication with secure storage
- **Account-based Organization**: Users belong to accounts which can own multiple lounges

## Architecture

The module follows a layered architecture:

```
┌─────────────────┐
│     Routes      │  ← HTTP request routing
├─────────────────┤
│   Controllers   │  ← Request handling & validation
├─────────────────┤
│    Services     │  ← Business logic (planned)
├─────────────────┤
│     Models      │  ← Data models & transformations
├─────────────────┤
│    Database     │  ← Prisma ORM & PostgreSQL
└─────────────────┘
```

## Database Schema

### User Table

- **id**: Unique identifier (CUID)
- **username**: User's login name (unique per account)
- **password**: Hashed password
- **email**: Optional email address (globally unique)
- **status**: User status (ACTIVE, SUSPENDED, DELETED)
- **pdAccountId**: Reference to the user's account
- **roleId**: Reference to the user's role
- **createdAt/updatedAt**: Timestamps

### Role Table

- **id**: Unique identifier (CUID)
- **name**: Role name (unique per account)
- **isDefault**: Whether this is a default system role
- **accountId**: Reference to the account that owns this role
- **createdAt/updatedAt**: Timestamps

### Permission Table

- **id**: Unique identifier (CUID)
- **key**: Permission key (globally unique, e.g., "user.create")
- **name**: Human-readable name for the permission
- **description**: Detailed description of what the permission allows
- **createdAt/updatedAt**: Timestamps

### RolePermission Table (Junction)

- **roleId**: Reference to role
- **permissionId**: Reference to permission
- **loungeId**: Reference to lounge (permissions are lounge-specific)
- **createdAt/updatedAt**: Timestamps
- **Composite Primary Key**: [roleId, permissionId, loungeId]

### PDAccount Table

- **id**: Unique identifier (UUID)
- **name**: Business or organization name
- **email**: Contact email (globally unique)
- **phone**: Contact phone number
- **status**: Account status (ACTIVE, SUSPENDED, TRIALING)
- **logoUrl**: Optional logo image URL
- **createdAt/updatedAt**: Timestamps

### Lounge Table

- **id**: Unique identifier (UUID)
- **pdAccountId**: Reference to the owning account
- **name**: Lounge name
- **location**: Physical location (optional)
- **latitude/longitude**: GPS coordinates (optional)
- **logoUrl**: Lounge logo (optional)
- **status**: Lounge status (ACTIVE, CLOSED, PENDING_APPROVAL)
- **createdAt/updatedAt**: Timestamps

## API Endpoints

### Permission Management

| Method | Endpoint                      | Description                                                           |
| ------ | ----------------------------- | --------------------------------------------------------------------- |
| GET    | `/api/permissions`            | [Get all permissions with filtering and pagination](#get-permissions) |
| GET    | `/api/permissions/stats`      | [Get permission statistics](#get-permission-stats)                    |
| GET    | `/api/permissions/categories` | [Get permissions grouped by category](#get-permissions-by-category)   |
| GET    | `/api/permissions/:id`        | [Get permission by ID](#get-permission-by-id)                         |
| POST   | `/api/permissions`            | [Create new permission](#create-permission)                           |
| PUT    | `/api/permissions/:id`        | [Update permission](#update-permission)                               |
| DELETE | `/api/permissions/:id`        | [Delete permission](#delete-permission)                               |

### Role Management

| Method | Endpoint                                                 | Description                                                 |
| ------ | -------------------------------------------------------- | ----------------------------------------------------------- |
| GET    | `/api/roles`                                             | [Get all roles with filtering and pagination](#get-roles)   |
| GET    | `/api/roles/stats`                                       | [Get role statistics](#get-role-stats)                      |
| GET    | `/api/roles/account/:accountId`                          | [Get roles by account](#get-roles-by-account)               |
| GET    | `/api/roles/:id`                                         | [Get role by ID](#get-role-by-id)                           |
| POST   | `/api/roles`                                             | [Create new role](#create-role)                             |
| PUT    | `/api/roles/:id`                                         | [Update role](#update-role)                                 |
| DELETE | `/api/roles/:id`                                         | [Delete role](#delete-role)                                 |
| POST   | `/api/roles/permissions`                                 | [Assign permission to role](#assign-permission-to-role)     |
| DELETE | `/api/roles/:roleId/permissions/:permissionId/:loungeId` | [Remove permission from role](#remove-permission-from-role) |

### User Management

_Note: User endpoints are currently under development_

| Method | Endpoint           | Description                  |
| ------ | ------------------ | ---------------------------- |
| GET    | `/api/users`       | Get all users with filtering |
| GET    | `/api/users/:id`   | Get user by ID               |
| POST   | `/api/users`       | Create new user              |
| PUT    | `/api/users/:id`   | Update user                  |
| DELETE | `/api/users/:id`   | Delete user                  |
| POST   | `/api/users/login` | User authentication          |

## Models

### User Model

Located in `models/user.model.ts`

**Key Interfaces:**

- `UserModel`: Base user type from Prisma
- `UserWithRelations`: User with PDAccount and role data
- `CreateUserInput`: Data for creating new users
- `UpdateUserInput`: Data for updating users
- `UserResponse`: Public user data (excludes password)
- `UserFilters`: Query filtering options
- `UserStats`: User statistics for dashboards
- `LoginInput`: Authentication input
- `ChangePasswordInput`: Password change data

**Key Functions:**

- `userToResponse()`: Transform user to safe response format
- `usersToResponse()`: Transform multiple users
- `isActiveUser()`: Check if user is active
- `canUserLogin()`: Check if user can authenticate

**Validation Rules:**

- Username: 3-50 characters, unique per account
- Password: Minimum 8 characters
- Email: Valid email format (optional)

### Role Model

Located in `models/role.model.ts`

**Key Interfaces:**

- `RoleModel`: Base role structure
- `RoleWithRelations`: Role with account, users, and permissions including lounge data
- `CreateRoleInput`: Data for creating roles (requires accountId and loungeId)
- `UpdateRoleInput`: Data for updating roles (includes loungeId for permission updates)
- `RoleResponse`: Public role data
- `RoleFilters`: Query filtering options (supports both accountId and loungeId filtering)
- `RoleStats`: Role statistics
- `RoleAssignmentInput`: For assigning roles to users
- `BulkRoleAssignmentInput`: For bulk role assignments

**Key Enums:**

- `DefaultRoleTypes`: Standard role types (ADMIN, MANAGER, EMPLOYEE, CUSTOMER, GUEST)

**Key Functions:**

- `roleToResponse()`: Transform role to response format
- `rolesToResponse()`: Transform multiple roles
- `isDefaultRole()`: Check if role is system default
- `canDeleteRole()`: Check if role can be safely deleted
- `roleHasPermission()`: Check if role has specific permission
- `roleHasAnyPermission()`: Check for any of multiple permissions
- `roleHasAllPermissions()`: Check for all specified permissions
- `getRolePermissionKeys()`: Get all permission keys for a role

**Validation Rules:**

- Name: 2-50 characters, unique per account
- Maximum 100 permissions per role
- Reserved names: admin, super_admin, system

### Permission Model

Located in `models/permission.model.ts`

**Key Interfaces:**

- `PermissionModel`: Base permission type
- `PermissionWithRelations`: Permission with role data
- `CreatePermissionInput`: Data for creating permissions (includes name, key, description)
- `UpdatePermissionInput`: Data for updating permissions
- `PermissionResponse`: Public permission data (includes name field)
- `PermissionFilters`: Query filtering options
- `PermissionPaginationOptions`: Pagination settings

**Key Functions:**

- `permissionToResponse()`: Transform permission to response format
- `permissionsToResponse()`: Transform multiple permissions
- `isValidPermissionKey()`: Validate permission key format
- `getPermissionCategory()`: Extract category from permission key (planned)
- `groupPermissionsByCategory()`: Group permissions by domain (planned)

**Validation Rules:**

- Key: 3-100 characters, follows pattern `category.action`
- Name: 3-50 characters, human-readable
- Description: 5-255 characters
- Key must be globally unique

## Controllers

### Permission Controller

Located in `controllers/permission.controller.ts`

**Available Functions:**

- `getPermissions`: Get all permissions with filtering, search, and pagination
- `getPermissionById`: Get single permission by ID with role assignments
- `createPermission`: Create new permission with validation
- `updatePermission`: Update existing permission
- `deletePermission`: Delete permission (restricted if in use)
- `getPermissionsByCategory`: Get permissions grouped by category
- `getPermissionStats`: Get permission statistics

#### Get Permissions

```typescript
GET /api/permissions?search=user&category=user&page=1&limit=10
```

**Query Parameters:**

- `search`: Search in key/name/description
- `roleId`: Filter by role
- `category`: Filter by permission category
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `sortBy`: Sort field (key, description)
- `sortOrder`: Sort direction (asc, desc)

**Response:**

```json
{
  "data": [
    {
      "id": "perm123",
      "key": "user.create",
      "name": "Create Users",
      "description": "Allows creating new users",
      "roleCount": 2
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

#### Create Permission

```typescript
POST / api / permissions;
```

**Request Body:**

```json
{
  "key": "user.create",
  "name": "Create Users",
  "description": "Allows creating new users in the system"
}
```

**Validation:**

- Key must follow pattern: `category.action` (e.g., "user.create")
- Key must be unique
- Name: 3-50 characters
- Description: 5-255 characters

### Role Controller

Located in `controllers/role.controller.ts`

**Available Functions:**

- `getRoles`: Get all roles with filtering and pagination
- `getRoleById`: Get single role by ID with full relations
- `createRole`: Create new role with permissions
- `updateRole`: Update role and permissions
- `deleteRole`: Delete role (with restrictions)
- `getRolesByAccount`: Get all roles for an account
- `getRoleStats`: Get role statistics
- `assignPermissionToRole`: Assign permission to role for specific lounge
- `removePermissionFromRole`: Remove permission from role for specific lounge

#### Get Roles

```typescript
GET /api/roles?accountId=acc123&loungeId=lounge456&search=manager&page=1&limit=10
```

**Query Parameters:**

- `accountId`: Filter by account
- `loungeId`: Filter by lounge (through role permissions)
- `isDefault`: Filter by default roles (true/false)
- `search`: Search in role name
- `hasPermission`: Filter by permission key
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `sortBy`: Sort field (name, isDefault, createdAt)
- `sortOrder`: Sort direction (asc, desc)

**Response:**

```json
{
  "data": [
    {
      "id": "role123",
      "name": "Manager",
      "isDefault": false,
      "accountId": "acc123",
      "permissions": [
        {
          "id": "perm123",
          "key": "user.read",
          "name": "Read Users",
          "description": "Read user data"
        }
      ],
      "userCount": 5
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 8,
    "pages": 1
  }
}
```

#### Create Role

```typescript
POST / api / roles;
```

**Request Body:**

```json
{
  "name": "Manager",
  "accountId": "acc123",
  "loungeId": "lounge456",
  "isDefault": false,
  "permissionIds": ["perm123", "perm456"]
}
```

**Validation:**

- Name: 2-50 characters, unique per account
- Cannot use reserved names: admin, super_admin, system
- Maximum 100 permissions per role
- Account and lounge must exist
- All permission IDs must be valid

#### Assign Permission to Role

```typescript
POST / api / roles / permissions;
```

**Request Body:**

```json
{
  "roleId": "role123",
  "permissionId": "perm456",
  "loungeId": "lounge789"
}
```

**Note**: Permissions are assigned per lounge, allowing the same role to have different permissions in different lounges.

### User Controller

_Currently under development_

Located in `controllers/user.controller.ts`

**Planned Functions:**

- User registration and authentication
- Profile management
- User status updates
- Password changes
- User statistics

## Services

### User Service

_Currently under development_

Located in `services/user.service.ts`

Will provide business logic for:

- User authentication
- Password hashing and validation
- User profile operations
- Role assignments
- Permission checking

## Routes

### Permission Routes

Located in `routes/permission.routes.ts`

All permission-related endpoints are configured with proper middleware and validation.

### Role Routes

Located in `routes/role.routes.ts`

All role-related endpoints including:

- CRUD operations for roles
- Role-permission assignments
- Lounge-specific role filtering
- Role statistics and analytics

### User Routes

_Currently under development_

Located in `routes/user.routes.ts`

Will include all user management endpoints with authentication middleware.

## Usage Examples

### Creating a Permission

```typescript
import { createPermission } from "../controllers/permission.controller";

// Create a new permission
const permissionData = {
  key: "booking.create",
  description: "Allows creating new bookings",
};
```

### Checking User Permissions

```typescript
import { roleHasPermission } from "../models/role.model";

// Check if user's role has specific permission
const canCreateUsers = roleHasPermission(userRole, "user.create");
```

### Filtering Permissions

```typescript
// Get all user-related permissions
GET /api/permissions?category=user

// Search permissions
GET /api/permissions?search=create

// Get permissions for specific role
GET /api/permissions?roleId=role123
```

## Validation Rules

### Permission Keys

- Format: `category.action` (lowercase, dots allowed)
- Examples: `user.create`, `lounge.manage`, `booking.read`
- Length: 3-100 characters
- Must be unique globally

### User Data

- Username: 3-50 characters, unique per lounge
- Password: Minimum 8 characters
- Email: Valid email format, globally unique (optional)

### Role Data

- Name: 2-50 characters, unique per lounge
- Maximum 100 permissions per role
- Reserved names: admin, super_admin, system

## Security Features

1. **Password Security**: Passwords are hashed before storage
2. **Multi-tenancy**: Users are scoped to lounges
3. **Role-based Access**: Granular permission system
4. **Input Validation**: Comprehensive validation on all inputs
5. **SQL Injection Prevention**: Using Prisma ORM parameterized queries
6. **Unique Constraints**: Prevent duplicate usernames/emails
7. **Status Management**: Soft delete and suspension capabilities

---

_This module is part of the PlayDesk Services application. For questions or contributions, please refer to the main project documentation._
