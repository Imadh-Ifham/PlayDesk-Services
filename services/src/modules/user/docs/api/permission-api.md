# Permission Management API

Comprehensive API documentation for permission management endpoints in the User Module.

## 📋 Overview

The Permission API provides complete CRUD operations for managing permissions in the PlayDesk system. Permissions follow a category-based naming convention and support role assignments with lounge-specific contexts.

**Base Path**: `/api/user/permissions`

## 🔗 Quick Navigation

- [Get Permissions](#get-permissions) - List with filtering and pagination
- [Get Permission Stats](#get-permission-stats) - Usage statistics
- [Get Permissions by Category](#get-permissions-by-category) - Category groupings
- [Get Usage Analytics](#get-usage-analytics) - Permission usage analytics
- [Get Permission by ID](#get-permission-by-id) - Single permission details
- [Create Permission](#create-permission) - Create new permission
- [Update Permission](#update-permission) - Modify existing permission
- [Delete Permission](#delete-permission) - Remove permission

## 📚 Endpoints

### Get Permissions

Retrieve all permissions with advanced filtering, search, and pagination capabilities.

**Endpoint**: `GET /api/user/permissions`

#### Query Parameters

| Parameter   | Type   | Description                             | Default | Example                      |
| ----------- | ------ | --------------------------------------- | ------- | ---------------------------- |
| `search`    | string | Search in key, name, or description     | -       | `user`                       |
| `category`  | string | Filter by permission category           | -       | `user`, `role`, `permission` |
| `roleId`    | string | Filter permissions assigned to role     | -       | `role123`                    |
| `page`      | number | Page number for pagination              | `1`     | `2`                          |
| `limit`     | number | Items per page (max 100)                | `10`    | `25`                         |
| `sortBy`    | string | Sort field (`key`, `name`, `createdAt`) | `key`   | `name`                       |
| `sortOrder` | string | Sort direction (`asc`, `desc`)          | `asc`   | `desc`                       |

#### Example Request

```bash
GET /api/user/permissions?search=user&category=user&page=1&limit=10&sortBy=name&sortOrder=asc
```

#### Response Format

```typescript
{
  "data": [
    {
      "id": "clxxx123456",
      "key": "user.create",
      "name": "Create Users",
      "description": "Allows creating new users in the system",
      "category": "user",
      "roleCount": 3,
      "createdAt": "2025-08-07T10:30:00Z",
      "updatedAt": "2025-08-07T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3,
    "hasNext": true,
    "hasPrev": false
  }
}
```

#### Error Responses

```typescript
// Invalid query parameters
{
  "error": "Invalid query parameters",
  "details": "limit must be between 1 and 100"
}
```

---

### Get Permission Stats

Retrieve permission system statistics and analytics.

**Endpoint**: `GET /api/user/permissions/stats`

#### Response Format

```typescript
{
  "data": {
    "totalPermissions": 45,
    "byCategory": {
      "user": 12,
      "role": 8,
      "permission": 6,
      "lounge": 10,
      "booking": 9
    },
    "assignmentStats": {
      "totalAssignments": 127,
      "averagePerRole": 4.2,
      "mostAssigned": {
        "key": "user.read",
        "name": "Read Users",
        "assignmentCount": 15
      },
      "leastAssigned": {
        "key": "system.config",
        "name": "System Configuration",
        "assignmentCount": 1
      }
    },
    "recentActivity": {
      "created": 3,
      "updated": 7,
      "deleted": 1
    }
  }
}
```

---

### Get Permissions by Category

Retrieve permissions grouped by their category for organizational purposes.

**Endpoint**: `GET /api/user/permissions/categories`

#### Response Format

```typescript
{
  "data": {
    "user": [
      {
        "id": "clxxx123",
        "key": "user.create",
        "name": "Create Users",
        "description": "Allows creating new users",
        "roleCount": 3
      },
      {
        "id": "clxxx124",
        "key": "user.read",
        "name": "Read Users",
        "description": "Allows viewing user information",
        "roleCount": 8
      }
    ],
    "role": [
      {
        "id": "clxxx125",
        "key": "role.create",
        "name": "Create Roles",
        "description": "Allows creating new roles",
        "roleCount": 2
      }
    ]
  },
  "meta": {
    "totalCategories": 5,
    "totalPermissions": 45
  }
}
```

---

### Get Usage Analytics

Retrieve detailed permission usage analytics.

**Endpoint**: `GET /api/user/permissions/usage-analytics`

#### Response Format

```typescript
{
  "data": {
    "overview": {
      "totalPermissions": 45,
      "assignedPermissions": 38,
      "unassignedPermissions": 7,
      "utilizationRate": 84.4
    },
    "topPermissions": [
      {
        "key": "user.read",
        "name": "Read Users",
        "assignmentCount": 15,
        "roleNames": ["Admin", "Manager", "Employee"]
      }
    ],
    "categoryUtilization": {
      "user": { "total": 12, "assigned": 11, "rate": 91.7 },
      "role": { "total": 8, "assigned": 6, "rate": 75.0 }
    },
    "trends": {
      "last30Days": {
        "created": 5,
        "assigned": 23,
        "unassigned": 4
      }
    }
  }
}
```

---

### Get Permission by ID

Retrieve detailed information about a specific permission, including role assignments.

**Endpoint**: `GET /api/user/permissions/:id`

#### Path Parameters

| Parameter | Type   | Description          |
| --------- | ------ | -------------------- |
| `id`      | string | Permission ID (CUID) |

#### Example Request

```bash
GET /api/user/permissions/clxxx123456
```

#### Response Format

```typescript
{
  "data": {
    "id": "clxxx123456",
    "key": "user.create",
    "name": "Create Users",
    "description": "Allows creating new users in the system",
    "category": "user",
    "createdAt": "2025-08-07T10:30:00Z",
    "updatedAt": "2025-08-07T10:30:00Z",
    "roles": [
      {
        "id": "role123",
        "name": "Admin",
        "accountId": "acc123",
        "lounges": [
          {
            "id": "lounge456",
            "name": "Downtown Lounge",
            "assignedAt": "2025-08-07T11:00:00Z"
          }
        ]
      }
    ],
    "stats": {
      "totalRoleAssignments": 3,
      "totalLoungeContexts": 5
    }
  }
}
```

#### Error Responses

```typescript
// Permission not found
{
  "error": "Permission not found",
  "details": "No permission exists with the provided ID"
}
```

---

### Create Permission

Create a new permission with validation for uniqueness and format.

**Endpoint**: `POST /api/user/permissions`

#### Request Body

```typescript
{
  "key": "booking.create",
  "name": "Create Bookings",
  "description": "Allows creating new bookings for lounges"
}
```

#### Validation Rules

- **key**: 3-100 characters, format `category.action`, globally unique
- **name**: 3-50 characters, human-readable
- **description**: 5-255 characters, detailed explanation

#### Example Request

```bash
POST /api/user/permissions
Content-Type: application/json

{
  "key": "booking.create",
  "name": "Create Bookings",
  "description": "Allows creating new bookings for lounges and managing booking schedules"
}
```

#### Response Format

```typescript
{
  "data": {
    "id": "clxxx789012",
    "key": "booking.create",
    "name": "Create Bookings",
    "description": "Allows creating new bookings for lounges and managing booking schedules",
    "category": "booking",
    "createdAt": "2025-08-08T09:15:00Z",
    "updatedAt": "2025-08-08T09:15:00Z"
  }
}
```

#### Error Responses

```typescript
// Validation errors
{
  "error": "Validation failed",
  "details": "Permission key 'booking.create' already exists"
}

// Invalid key format
{
  "error": "Invalid permission key format",
  "details": "Permission key must follow pattern 'category.action'"
}
```

---

### Update Permission

Update an existing permission's name and description. The key cannot be modified.

**Endpoint**: `PUT /api/user/permissions/:id`

#### Path Parameters

| Parameter | Type   | Description          |
| --------- | ------ | -------------------- |
| `id`      | string | Permission ID (CUID) |

#### Request Body

```typescript
{
  "name": "Create User Accounts",
  "description": "Allows creating new user accounts with full profile setup"
}
```

#### Example Request

```bash
PUT /api/user/permissions/clxxx123456
Content-Type: application/json

{
  "name": "Create User Accounts",
  "description": "Allows creating new user accounts with full profile setup and initial role assignment"
}
```

#### Response Format

```typescript
{
  "data": {
    "id": "clxxx123456",
    "key": "user.create",
    "name": "Create User Accounts",
    "description": "Allows creating new user accounts with full profile setup and initial role assignment",
    "category": "user",
    "createdAt": "2025-08-07T10:30:00Z",
    "updatedAt": "2025-08-08T09:20:00Z"
  }
}
```

---

### Delete Permission

Delete a permission if it's not currently assigned to any roles.

**Endpoint**: `DELETE /api/user/permissions/:id`

#### Path Parameters

| Parameter | Type   | Description          |
| --------- | ------ | -------------------- |
| `id`      | string | Permission ID (CUID) |

#### Example Request

```bash
DELETE /api/user/permissions/clxxx123456
```

#### Response Format

```typescript
{
  "data": {
    "message": "Permission deleted successfully",
    "deletedPermission": {
      "id": "clxxx123456",
      "key": "user.create",
      "name": "Create Users"
    }
  }
}
```

#### Error Responses

```typescript
// Permission in use
{
  "error": "Cannot delete permission",
  "details": "Permission is currently assigned to 3 roles. Remove all assignments before deletion."
}

// Permission not found
{
  "error": "Permission not found",
  "details": "No permission exists with the provided ID"
}
```

## 🔐 Authentication & Authorization

### Required Permissions

| Endpoint                  | Required Permission | Scope  |
| ------------------------- | ------------------- | ------ |
| `GET /permissions`        | `permission.read`   | Global |
| `GET /permissions/stats`  | `permission.read`   | Global |
| `GET /permissions/:id`    | `permission.read`   | Global |
| `POST /permissions`       | `permission.create` | Global |
| `PUT /permissions/:id`    | `permission.update` | Global |
| `DELETE /permissions/:id` | `permission.delete` | Global |

### Authentication Headers

```bash
Authorization: Bearer <jwt-token>
```

## 📊 Best Practices

### Naming Conventions

```typescript
// Good permission keys
"user.create"; // Clear category and action
"booking.manage"; // Specific scope
"lounge.admin"; // Administrative level

// Avoid
"create_user"; // Wrong format
"users"; // No action specified
"admin"; // Too vague
```

### Category Organization

| Category     | Description           | Examples                                    |
| ------------ | --------------------- | ------------------------------------------- |
| `user`       | User management       | `user.create`, `user.read`, `user.update`   |
| `role`       | Role management       | `role.create`, `role.assign`, `role.delete` |
| `permission` | Permission management | `permission.create`, `permission.manage`    |
| `lounge`     | Lounge operations     | `lounge.create`, `lounge.manage`            |
| `booking`    | Booking system        | `booking.create`, `booking.cancel`          |

### Error Handling

```typescript
// Always check for errors
try {
  const response = await fetch("/api/user/permissions");
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Request failed");
  }

  return data;
} catch (error) {
  console.error("Permission API error:", error.message);
  // Handle error appropriately
}
```

## 🔗 Related Documentation

- [Role API](./role-api.md) - Role management with permission assignments
- [Permission Architecture](../architecture/permission-architecture.md) - Detailed system design
- [Routes Overview](./routes-overview.md) - Complete API overview

---

💡 **Need Help?** Check the [Permission Architecture](../architecture/permission-architecture.md) documentation for detailed system design and business logic information.
