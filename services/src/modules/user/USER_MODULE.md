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
  - [API Endpoints](#api-endpoints)
    - [Permission Management](#permission-management)
    - [User Management](#user-management)
    - [Role Management](#role-management)
  - [Models](#models)
    - [User Model](#user-model)
    - [Role Model](#role-model)
    - [Permission Model](#permission-model)
  - [Controllers](#controllers)
    - [Permission Controller](#permission-controller)
      - [Get Permissions](#get-permissions)
      - [Get Permission by ID](#get-permission-by-id)
      - [Create Permission](#create-permission)
      - [Update Permission](#update-permission)
      - [Delete Permission](#delete-permission)
      - [Get Permissions by Category](#get-permissions-by-category)
      - [Get Permission Stats](#get-permission-stats)
    - [User Controller](#user-controller)
  - [Services](#services)
    - [User Service](#user-service)
  - [Routes](#routes)
    - [Permission Routes](#permission-routes)
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
- **Multi-tenancy**: Users are scoped to specific lounges
- **User Status Management**: Active, suspended, and deleted user states
- **Authentication Support**: Password-based authentication with secure storage

## Architecture

The module follows a layered architecture:

```
┌─────────────────┐
│     Routes      │  ← HTTP request routing
├─────────────────┤
│   Controllers   │  ← Request handling & validation
├─────────────────┤
│    Services     │  ← Business logic
├─────────────────┤
│     Models      │  ← Data models & transformations
├─────────────────┤
│    Database     │  ← Prisma ORM & PostgreSQL
└─────────────────┘
```

## Database Schema

### User Table

- **id**: Unique identifier (CUID)
- **username**: User's login name (unique per lounge)
- **password**: Hashed password
- **email**: Optional email address (globally unique)
- **status**: User status (ACTIVE, SUSPENDED, DELETED)
- **loungeId**: Reference to the user's lounge
- **roleId**: Reference to the user's role
- **createdAt/updatedAt**: Timestamps

### Role Table

- **id**: Unique identifier (CUID)
- **name**: Role name (unique per lounge)
- **isDefault**: Whether this is a default system role
- **loungeId**: Reference to the lounge

### Permission Table

- **id**: Unique identifier (CUID)
- **key**: Permission key (globally unique, e.g., "user.create")
- **description**: Human-readable description

### RolePermission Table (Junction)

- **roleId**: Reference to role
- **permissionId**: Reference to permission

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

### Role Management

| Method | Endpoint                                       | Description                                                 |
| ------ | ---------------------------------------------- | ----------------------------------------------------------- |
| GET    | `/api/roles`                                   | [Get all roles with filtering and pagination](#get-roles)   |
| GET    | `/api/roles/stats`                             | [Get role statistics](#get-role-stats)                      |
| GET    | `/api/roles/lounge/:loungeId`                  | [Get roles by lounge](#get-roles-by-lounge)                 |
| GET    | `/api/roles/:id`                               | [Get role by ID](#get-role-by-id)                           |
| POST   | `/api/roles`                                   | [Create new role](#create-role)                             |
| PUT    | `/api/roles/:id`                               | [Update role](#update-role)                                 |
| DELETE | `/api/roles/:id`                               | [Delete role](#delete-role)                                 |
| POST   | `/api/roles/permissions`                       | [Assign permission to role](#assign-permission-to-role)     |
| DELETE | `/api/roles/:roleId/permissions/:permissionId` | [Remove permission from role](#remove-permission-from-role) |

## Models

### User Model

Located in `models/user.model.ts`

**Key Interfaces:**

- `UserModel`: Base user type from Prisma
- `UserWithRelations`: User with lounge and role data
- `CreateUserInput`: Data for creating new users
- `UpdateUserInput`: Data for updating users
- `UserResponse`: Public user data (excludes password)
- `UserFilters`: Query filtering options
- `UserStats`: User statistics for dashboards

**Key Functions:**

- `userToResponse()`: Transform user to safe response format
- `usersToResponse()`: Transform multiple users
- `isActiveUser()`: Check if user is active
- `canUserLogin()`: Check if user can authenticate

**Validation Rules:**

- Username: 3-50 characters
- Password: Minimum 8 characters
- Email: Valid email format (optional)

### Role Model

Located in `models/role.model.ts`

**Key Interfaces:**

- `RoleModel`: Base role structure
- `RoleWithRelations`: Role with lounge, users, and permissions
- `CreateRoleInput`: Data for creating roles
- `UpdateRoleInput`: Data for updating roles
- `RoleResponse`: Public role data
- `RoleFilters`: Query filtering options

**Key Functions:**

- `roleToResponse()`: Transform role to response format
- `isDefaultRole()`: Check if role is system default
- `canDeleteRole()`: Check if role can be safely deleted
- `roleHasPermission()`: Check if role has specific permission
- `roleHasAnyPermission()`: Check for any of multiple permissions
- `roleHasAllPermissions()`: Check for all specified permissions

### Permission Model

Located in `models/permission.model.ts`

**Key Interfaces:**

- `PermissionModel`: Base permission type
- `PermissionWithRelations`: Permission with role data
- `CreatePermissionInput`: Data for creating permissions
- `UpdatePermissionInput`: Data for updating permissions
- `PermissionResponse`: Public permission data

**Key Enums:**

- `PermissionCategories`: Standard permission categories (user, lounge, role, etc.)
- `PermissionActions`: Common actions (create, read, update, delete, manage)
- `DefaultPermissions`: Pre-defined system permissions

**Key Functions:**

- `permissionToResponse()`: Transform permission to response format
- `isValidPermissionKey()`: Validate permission key format
- `getPermissionCategory()`: Extract category from permission key
- `groupPermissionsByCategory()`: Group permissions by domain
- `permissionAllowsAction()`: Check if permission grants access to action

## Controllers

### Permission Controller

Located in `controllers/permission.controller.ts`

#### Get Permissions

```typescript
GET /api/permissions?search=user&category=user&page=1&limit=10
```

**Query Parameters:**

- `search`: Search in key/description
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
      "description": "Create new users",
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

#### Get Permission by ID

```typescript
GET /api/permissions/:id
```

Returns single permission with role assignments.

#### Create Permission

```typescript
POST / api / permissions;
```

**Request Body:**

```json
{
  "key": "user.create",
  "description": "Allows creating new users"
}
```

**Validation:**

- Key must follow pattern: `category.action` (e.g., "user.create")
- Key must be unique
- Description: 5-255 characters

#### Update Permission

```typescript
PUT /api/permissions/:id
```

**Request Body:**

```json
{
  "key": "user.update",
  "description": "Updated description"
}
```

#### Delete Permission

```typescript
DELETE /api/permissions/:id
```

**Restrictions:**

- Cannot delete permissions assigned to roles
- Returns 409 if permission is in use

#### Get Permissions by Category

```typescript
GET / api / permissions / categories;
```

Returns permissions grouped by category (user, lounge, role, etc.).

#### Get Permission Stats

```typescript
GET / api / permissions / stats;
```

**Response:**

```json
{
  "total": 25,
  "mostUsedPermission": {
    "id": "perm123",
    "key": "user.read",
    "roleCount": 5
  },
  "leastUsedPermission": {
    "id": "perm456",
    "key": "system.admin",
    "roleCount": 1
  }
}
```

### Role Controller

Located in `controllers/role.controller.ts`

#### Get Roles

```typescript
GET /api/roles?loungeId=lounge123&search=admin&page=1&limit=10
```

**Query Parameters:**

- `loungeId`: Filter by lounge
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
      "loungeId": "lounge123",
      "permissions": [
        {
          "id": "perm123",
          "key": "user.read",
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

#### Get Role by ID

```typescript
GET /api/roles/:id
```

Returns single role with permissions and user count.

#### Create Role

```typescript
POST / api / roles;
```

**Request Body:**

```json
{
  "name": "Manager",
  "loungeId": "lounge123",
  "isDefault": false,
  "permissionIds": ["perm123", "perm456"]
}
```

**Validation:**

- Name: 2-50 characters, unique per lounge
- Cannot use reserved names: admin, super_admin, system
- Maximum 100 permissions per role
- Lounge must exist

#### Update Role

```typescript
PUT /api/roles/:id
```

**Request Body:**

```json
{
  "name": "Senior Manager",
  "isDefault": false,
  "permissionIds": ["perm123", "perm456", "perm789"]
}
```

#### Delete Role

```typescript
DELETE /api/roles/:id
```

**Restrictions:**

- Cannot delete default roles
- Cannot delete roles with assigned users
- Returns 409 if role cannot be deleted

#### Get Roles by Lounge

```typescript
GET /api/roles/lounge/:loungeId
```

Returns all roles for a specific lounge, ordered by name.

#### Get Role Stats

```typescript
GET /api/roles/stats?loungeId=lounge123
```

**Response:**

```json
{
  "total": 8,
  "defaultRoles": 3,
  "customRoles": 5,
  "mostUsedRole": {
    "id": "role123",
    "name": "Employee",
    "userCount": 15
  }
}
```

#### Assign Permission to Role

```typescript
POST / api / roles / permissions;
```

**Request Body:**

```json
{
  "roleId": "role123",
  "permissionId": "perm456"
}
```

#### Remove Permission from Role

```typescript
DELETE /api/roles/:roleId/permissions/:permissionId
```

Removes specific permission assignment from role.

### User Controller

_Currently under development_

Located in `controllers/user.controller.ts`

Will include functions for:

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
