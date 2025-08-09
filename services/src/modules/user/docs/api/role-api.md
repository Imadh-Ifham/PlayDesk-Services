# Role Management API

Comprehensive API documentation for role management endpoints in the User Module, including the three-tier role system (SYSTEM, GLOBAL, ACCOUNT) and lounge-specific permission assignments.

## 📋 Overview

The Role API provides complete CRUD operations for managing roles in the PlayDesk system. The system implements a three-tier role hierarchy with account-scoped roles and lounge-specific permission contexts.

**Base Path**: `/api/user/roles`

## 🏛️ Role Hierarchy

```
SYSTEM Roles (roleType: SYSTEM)
├── Platform administrators only
├── Cannot be created via API
└── Full system access

GLOBAL Roles (roleType: GLOBAL)
├── Platform-wide roles
├── Admin-only creation
└── Cross-account permissions

ACCOUNT Roles (roleType: ACCOUNT)
├── Organization-specific
├── Account admin creation
└── Lounge-scoped permissions
```

## 🔗 Quick Navigation

- [Get Roles](#get-roles) - List with filtering and pagination
- [Get Role Stats](#get-role-stats) - Role statistics
- [Get Roles by Account](#get-roles-by-account) - Account-specific roles
- [Get Role by ID](#get-role-by-id) - Single role details
- [Create Role](#create-role) - Create new role
- [Update Role](#update-role) - Modify existing role
- [Delete Role](#delete-role) - Remove role
- [Assign Permission](#assign-permission) - Assign permission to role
- [Remove Permission](#remove-permission) - Remove permission from role

## 📚 Endpoints

### Get Roles

Retrieve all roles with advanced filtering, search, and pagination capabilities.

**Endpoint**: `GET /api/user/roles`

#### Query Parameters

| Parameter       | Type    | Description                                   | Default | Example                       |
| --------------- | ------- | --------------------------------------------- | ------- | ----------------------------- |
| `accountId`     | string  | Filter by account ID                          | -       | `acc123`                      |
| `loungeId`      | string  | Filter by lounge context                      | -       | `lounge456`                   |
| `roleType`      | string  | Filter by role type                           | -       | `ACCOUNT`, `GLOBAL`, `SYSTEM` |
| `isDefault`     | boolean | Filter system default roles                   | -       | `true`, `false`               |
| `search`        | string  | Search in role name                           | -       | `manager`                     |
| `hasPermission` | string  | Filter by permission key                      | -       | `user.create`                 |
| `page`          | number  | Page number for pagination                    | `1`     | `2`                           |
| `limit`         | number  | Items per page (max 100)                      | `10`    | `25`                          |
| `sortBy`        | string  | Sort field (`name`, `createdAt`, `isDefault`) | `name`  | `createdAt`                   |
| `sortOrder`     | string  | Sort direction (`asc`, `desc`)                | `asc`   | `desc`                        |

#### Example Request

```bash
GET /api/user/roles?accountId=acc123&roleType=ACCOUNT&search=manager&page=1&limit=10
```

#### Response Format

```typescript
{
  "data": [
    {
      "id": "role123",
      "name": "Lounge Manager",
      "roleType": "ACCOUNT",
      "isDefault": false,
      "accountId": "acc123",
      "account": {
        "id": "acc123",
        "name": "Downtown Gaming Center",
        "email": "contact@downtown-gaming.com"
      },
      "permissions": [
        {
          "id": "perm123",
          "key": "user.read",
          "name": "Read Users",
          "description": "View user information",
          "lounges": [
            {
              "id": "lounge456",
              "name": "Main Gaming Floor",
              "assignedAt": "2025-08-07T10:30:00Z"
            }
          ]
        }
      ],
      "userCount": 5,
      "permissionCount": 8,
      "createdAt": "2025-08-07T10:30:00Z",
      "updatedAt": "2025-08-07T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 15,
    "pages": 2,
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
  "details": "roleType must be one of: SYSTEM, GLOBAL, ACCOUNT"
}
```

---

### Get Role Stats

Retrieve role system statistics and distribution analytics.

**Endpoint**: `GET /api/user/roles/stats`

#### Response Format

```typescript
{
  "data": {
    "totalRoles": 45,
    "byType": {
      "SYSTEM": 3,
      "GLOBAL": 5,
      "ACCOUNT": 37
    },
    "byAccount": {
      "acc123": 12,
      "acc456": 8,
      "acc789": 17
    },
    "defaultRoles": {
      "total": 8,
      "active": 7,
      "unused": 1
    },
    "permissionDistribution": {
      "averagePermissionsPerRole": 6.3,
      "maxPermissions": 25,
      "minPermissions": 1,
      "rolesWithoutPermissions": 3
    },
    "userAssignments": {
      "totalAssignments": 234,
      "averageUsersPerRole": 5.2,
      "mostAssignedRole": {
        "id": "role123",
        "name": "Employee",
        "userCount": 45
      },
      "unassignedRoles": 7
    },
    "recentActivity": {
      "created": 3,
      "updated": 12,
      "deleted": 1,
      "permissionsAssigned": 18,
      "permissionsRemoved": 5
    }
  }
}
```

---

### Get Roles by Account

Retrieve all roles for a specific account.

**Endpoint**: `GET /api/user/roles/account/:accountId`

#### Path Parameters

| Parameter   | Type   | Description       |
| ----------- | ------ | ----------------- |
| `accountId` | string | Account ID (UUID) |

#### Query Parameters

| Parameter            | Type    | Description                | Default |
| -------------------- | ------- | -------------------------- | ------- |
| `loungeId`           | string  | Filter by lounge context   | -       |
| `includePermissions` | boolean | Include permission details | `true`  |
| `includeUsers`       | boolean | Include user count         | `true`  |

#### Example Request

```bash
GET /api/user/roles/account/acc123?loungeId=lounge456&includePermissions=true
```

#### Response Format

```typescript
{
  "data": [
    {
      "id": "role123",
      "name": "Lounge Manager",
      "roleType": "ACCOUNT",
      "isDefault": false,
      "accountId": "acc123",
      "permissions": [
        {
          "id": "perm123",
          "key": "user.read",
          "name": "Read Users",
          "loungeId": "lounge456",
          "assignedAt": "2025-08-07T10:30:00Z"
        }
      ],
      "userCount": 3,
      "createdAt": "2025-08-07T10:30:00Z"
    }
  ],
  "meta": {
    "accountId": "acc123",
    "accountName": "Downtown Gaming Center",
    "totalRoles": 8,
    "loungeId": "lounge456"
  }
}
```

---

### Get Role by ID

Retrieve detailed information about a specific role, including all relationships.

**Endpoint**: `GET /api/user/roles/:id`

#### Path Parameters

| Parameter | Type   | Description    |
| --------- | ------ | -------------- |
| `id`      | string | Role ID (CUID) |

#### Query Parameters

| Parameter            | Type    | Description                | Default |
| -------------------- | ------- | -------------------------- | ------- |
| `includeUsers`       | boolean | Include assigned users     | `false` |
| `includePermissions` | boolean | Include permission details | `true`  |

#### Example Request

```bash
GET /api/user/roles/role123?includeUsers=true&includePermissions=true
```

#### Response Format

```typescript
{
  "data": {
    "id": "role123",
    "name": "Lounge Manager",
    "roleType": "ACCOUNT",
    "isDefault": false,
    "accountId": "acc123",
    "account": {
      "id": "acc123",
      "name": "Downtown Gaming Center",
      "email": "contact@downtown-gaming.com",
      "status": "ACTIVE"
    },
    "permissions": [
      {
        "id": "perm123",
        "key": "user.read",
        "name": "Read Users",
        "description": "View user information and profiles",
        "category": "user",
        "lounges": [
          {
            "id": "lounge456",
            "name": "Main Gaming Floor",
            "assignedAt": "2025-08-07T10:30:00Z"
          },
          {
            "id": "lounge789",
            "name": "VIP Section",
            "assignedAt": "2025-08-07T11:00:00Z"
          }
        ]
      }
    ],
    "users": [
      {
        "id": "user123",
        "username": "john.manager",
        "email": "john@downtown-gaming.com",
        "status": "ACTIVE",
        "assignedAt": "2025-08-07T12:00:00Z"
      }
    ],
    "stats": {
      "permissionCount": 8,
      "userCount": 3,
      "loungeContexts": 5
    },
    "createdAt": "2025-08-07T10:30:00Z",
    "updatedAt": "2025-08-08T09:15:00Z"
  }
}
```

---

### Create Role

Create a new role with optional permission assignments.

**Endpoint**: `POST /api/user/roles`

#### Request Body

```typescript
{
  "name": "Shift Supervisor",
  "roleType": "ACCOUNT",
  "accountId": "acc123",
  "loungeId": "lounge456", // Required for permission assignments
  "isDefault": false,
  "permissionKeys": ["user.read", "booking.create", "lounge.monitor"]
}
```

#### Validation Rules

- **name**: 2-50 characters, unique per account for ACCOUNT roles
- **roleType**: Must be `ACCOUNT` (GLOBAL/SYSTEM creation restricted)
- **accountId**: Required for ACCOUNT roles, must exist
- **loungeId**: Required when assigning permissions
- **permissionKeys**: Optional, maximum 100 permissions per role

#### Example Request

```bash
POST /api/user/roles
Content-Type: application/json

{
  "name": "Gaming Floor Supervisor",
  "roleType": "ACCOUNT",
  "accountId": "acc123",
  "loungeId": "lounge456",
  "isDefault": false,
  "permissionKeys": [
    "user.read",
    "user.create",
    "booking.read",
    "booking.create",
    "lounge.monitor"
  ]
}
```

#### Response Format

```typescript
{
  "data": {
    "id": "role789",
    "name": "Gaming Floor Supervisor",
    "roleType": "ACCOUNT",
    "isDefault": false,
    "accountId": "acc123",
    "permissions": [
      {
        "id": "perm123",
        "key": "user.read",
        "name": "Read Users",
        "loungeId": "lounge456",
        "assignedAt": "2025-08-08T09:30:00Z"
      }
    ],
    "permissionCount": 5,
    "userCount": 0,
    "createdAt": "2025-08-08T09:30:00Z",
    "updatedAt": "2025-08-08T09:30:00Z"
  }
}
```

#### Error Responses

```typescript
// Role name already exists
{
  "error": "Role name already exists",
  "details": "A role with this name already exists in this account"
}

// Invalid role type
{
  "error": "Invalid role type",
  "details": "Only ACCOUNT roles can be created via API"
}

// Account not found
{
  "error": "Account not found",
  "details": "The specified account does not exist"
}
```

---

### Update Role

Update an existing role's name and permission assignments.

**Endpoint**: `PUT /api/user/roles/:id`

#### Path Parameters

| Parameter | Type   | Description    |
| --------- | ------ | -------------- |
| `id`      | string | Role ID (CUID) |

#### Request Body

```typescript
{
  "name": "Senior Shift Supervisor",
  "loungeId": "lounge456", // Required for permission updates
  "permissionKeys": ["user.read", "user.create", "booking.manage"]
}
```

#### Example Request

```bash
PUT /api/user/roles/role123
Content-Type: application/json

{
  "name": "Senior Gaming Floor Supervisor",
  "loungeId": "lounge456",
  "permissionKeys": [
    "user.read",
    "user.create",
    "user.update",
    "booking.read",
    "booking.create",
    "booking.update",
    "lounge.monitor",
    "lounge.manage"
  ]
}
```

#### Response Format

```typescript
{
  "data": {
    "id": "role123",
    "name": "Senior Gaming Floor Supervisor",
    "roleType": "ACCOUNT",
    "isDefault": false,
    "accountId": "acc123",
    "permissions": [
      {
        "id": "perm123",
        "key": "user.read",
        "name": "Read Users",
        "loungeId": "lounge456",
        "assignedAt": "2025-08-07T10:30:00Z"
      }
    ],
    "permissionCount": 8,
    "userCount": 3,
    "createdAt": "2025-08-07T10:30:00Z",
    "updatedAt": "2025-08-08T09:45:00Z"
  }
}
```

---

### Delete Role

Delete a role if it's not assigned to any users.

**Endpoint**: `DELETE /api/user/roles/:id`

#### Path Parameters

| Parameter | Type   | Description    |
| --------- | ------ | -------------- |
| `id`      | string | Role ID (CUID) |

#### Example Request

```bash
DELETE /api/user/roles/role123
```

#### Response Format

```typescript
{
  "data": {
    "message": "Role deleted successfully",
    "deletedRole": {
      "id": "role123",
      "name": "Gaming Floor Supervisor",
      "roleType": "ACCOUNT",
      "accountId": "acc123"
    }
  }
}
```

#### Error Responses

```typescript
// Role in use
{
  "error": "Cannot delete role",
  "details": "Role is currently assigned to 3 users. Reassign users before deletion."
}

// Default role protection
{
  "error": "Cannot delete default role",
  "details": "Default system roles cannot be deleted"
}
```

---

### Assign Permission

Assign a permission to a role for a specific lounge context.

**Endpoint**: `POST /api/user/roles/permissions`

#### Request Body

```typescript
{
  "roleId": "role123",
  "permissionId": "perm456",
  "loungeId": "lounge789"
}
```

#### Example Request

```bash
POST /api/user/roles/permissions
Content-Type: application/json

{
  "roleId": "role123",
  "permissionId": "perm456",
  "loungeId": "lounge789"
}
```

#### Response Format

```typescript
{
  "data": {
    "message": "Permission assigned successfully",
    "assignment": {
      "roleId": "role123",
      "roleName": "Gaming Floor Supervisor",
      "permissionId": "perm456",
      "permissionKey": "booking.manage",
      "permissionName": "Manage Bookings",
      "loungeId": "lounge789",
      "loungeName": "VIP Section",
      "assignedAt": "2025-08-08T10:00:00Z"
    }
  }
}
```

#### Error Responses

```typescript
// Permission already assigned
{
  "error": "Permission already assigned",
  "details": "This permission is already assigned to this role for this lounge"
}

// Role not found
{
  "error": "Role not found",
  "details": "The specified role does not exist"
}
```

---

### Remove Permission

Remove a permission from a role for a specific lounge context.

**Endpoint**: `DELETE /api/user/roles/:roleId/permissions/:permissionId/:loungeId`

#### Path Parameters

| Parameter      | Type   | Description          |
| -------------- | ------ | -------------------- |
| `roleId`       | string | Role ID (CUID)       |
| `permissionId` | string | Permission ID (CUID) |
| `loungeId`     | string | Lounge ID (UUID)     |

#### Example Request

```bash
DELETE /api/user/roles/role123/permissions/perm456/lounge789
```

#### Response Format

```typescript
{
  "data": {
    "message": "Permission removed successfully",
    "removal": {
      "roleId": "role123",
      "roleName": "Gaming Floor Supervisor",
      "permissionId": "perm456",
      "permissionKey": "booking.manage",
      "loungeId": "lounge789",
      "loungeName": "VIP Section",
      "removedAt": "2025-08-08T10:15:00Z"
    }
  }
}
```

#### Error Responses

```typescript
// Permission not assigned
{
  "error": "Permission not assigned",
  "details": "This permission is not assigned to this role for this lounge"
}
```

## 🔐 Authentication & Authorization

### Required Permissions

| Endpoint                          | Required Permission | Scope   |
| --------------------------------- | ------------------- | ------- |
| `GET /roles`                      | `role.read`         | Account |
| `GET /roles/stats`                | `role.read`         | Global  |
| `GET /roles/:id`                  | `role.read`         | Account |
| `POST /roles`                     | `role.create`       | Account |
| `PUT /roles/:id`                  | `role.update`       | Account |
| `DELETE /roles/:id`               | `role.delete`       | Account |
| `POST /roles/permissions`         | `role.manage`       | Account |
| `DELETE /roles/:id/permissions/*` | `role.manage`       | Account |

### Role Type Restrictions

| Role Type | Creation          | Modification      | Deletion          |
| --------- | ----------------- | ----------------- | ----------------- |
| `SYSTEM`  | ❌ API Restricted | ❌ API Restricted | ❌ API Restricted |
| `GLOBAL`  | ❌ Admin Only     | ❌ Admin Only     | ❌ Admin Only     |
| `ACCOUNT` | ✅ Account Admin  | ✅ Account Admin  | ✅ Account Admin  |

## 📊 Best Practices

### Role Naming Conventions

```typescript
// Good role names
"Lounge Manager"; // Clear hierarchy and scope
"Shift Supervisor"; // Specific responsibility
"Customer Service"; // Functional role
"VIP Host"; // Context-specific

// Avoid
"admin"; // Too generic
"user123"; // Non-descriptive
"Manager_2"; // Unclear versioning
```

### Permission Assignment Strategy

```typescript
// Recommended approach
{
  "name": "Gaming Floor Manager",
  "permissionKeys": [
    // Core user management
    "user.read",
    "user.create",

    // Booking management
    "booking.read",
    "booking.create",
    "booking.update",

    // Lounge monitoring
    "lounge.monitor",
    "lounge.settings"
  ]
}
```

### Role Hierarchy Design

```typescript
// Hierarchical permission structure
const roleHierarchy = {
  Customer: ["booking.read", "profile.update"],
  Host: ["...Customer", "customer.assist", "booking.create"],
  Supervisor: ["...Host", "user.read", "reports.view"],
  Manager: ["...Supervisor", "user.create", "role.assign"],
};
```

## 🔗 Related Documentation

- [Permission API](./permission-api.md) - Permission management endpoints
- [User API](./user-api.md) - User management with role assignments
- [Role Architecture](../architecture/role-architecture.md) - Detailed system design
- [Routes Overview](./routes-overview.md) - Complete API overview

---

💡 **Need Help?** Check the [Role Architecture](../architecture/role-architecture.md) documentation for detailed system design and business logic information.
