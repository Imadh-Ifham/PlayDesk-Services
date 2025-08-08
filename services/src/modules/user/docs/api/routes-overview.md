# User Module - Complete API Routes Overview

This document provides a comprehensive overview of all API routes in the User Module, organized by functional areas. For detailed endpoint specifications, see the individual API documentation files.

## 📚 Quick Navigation

- [Permission API](./permission-api.md) - Permission management endpoints
- [Role API](./role-api.md) - Role management endpoints
- [User API](./user-api.md) - User management endpoints

## 🌐 Base URL Structure

All User Module APIs are mounted under the base path: `/api/user`

```
/api/user/
├── permissions/     # Permission management
├── roles/          # Role management
└── users/          # User management (in development)
```

## 🔐 Permission Management Routes

**Base Path**: `/api/user/permissions`

| Method   | Endpoint           | Description                                                                    | Status    |
| -------- | ------------------ | ------------------------------------------------------------------------------ | --------- |
| `GET`    | `/`                | [Get all permissions](./permission-api.md#get-permissions)                     | ✅ Active |
| `GET`    | `/stats`           | [Get permission statistics](./permission-api.md#get-permission-stats)          | ✅ Active |
| `GET`    | `/categories`      | [Get permissions by category](./permission-api.md#get-permissions-by-category) | ✅ Active |
| `GET`    | `/usage-analytics` | [Get permission usage analytics](./permission-api.md#get-usage-analytics)      | ✅ Active |
| `GET`    | `/:id`             | [Get permission by ID](./permission-api.md#get-permission-by-id)               | ✅ Active |
| `POST`   | `/`                | [Create new permission](./permission-api.md#create-permission)                 | ✅ Active |
| `PUT`    | `/:id`             | [Update permission](./permission-api.md#update-permission)                     | ✅ Active |
| `DELETE` | `/:id`             | [Delete permission](./permission-api.md#delete-permission)                     | ✅ Active |

### Permission Query Parameters

**Common Filters**:

- `search` - Search in key/name/description
- `category` - Filter by permission category
- `roleId` - Filter by role assignment
- `page` & `limit` - Pagination controls
- `sortBy` & `sortOrder` - Sorting options

## 👥 Role Management Routes

**Base Path**: `/api/user/roles`

| Method   | Endpoint                                       | Description                                                    | Status    |
| -------- | ---------------------------------------------- | -------------------------------------------------------------- | --------- |
| `GET`    | `/`                                            | [Get all roles](./role-api.md#get-roles)                       | ✅ Active |
| `GET`    | `/stats`                                       | [Get role statistics](./role-api.md#get-role-stats)            | ✅ Active |
| `GET`    | `/account/:accountId`                          | [Get roles by account](./role-api.md#get-roles-by-account)     | ✅ Active |
| `GET`    | `/:id`                                         | [Get role by ID](./role-api.md#get-role-by-id)                 | ✅ Active |
| `POST`   | `/`                                            | [Create new role](./role-api.md#create-role)                   | ✅ Active |
| `PUT`    | `/:id`                                         | [Update role](./role-api.md#update-role)                       | ✅ Active |
| `DELETE` | `/:id`                                         | [Delete role](./role-api.md#delete-role)                       | ✅ Active |
| `POST`   | `/permissions`                                 | [Assign permission to role](./role-api.md#assign-permission)   | ✅ Active |
| `DELETE` | `/:roleId/permissions/:permissionId/:loungeId` | [Remove permission from role](./role-api.md#remove-permission) | ✅ Active |

### Role Query Parameters

**Common Filters**:

- `accountId` - Filter by account
- `loungeId` - Filter by lounge context
- `roleType` - Filter by role type (SYSTEM/GLOBAL/ACCOUNT)
- `isDefault` - Filter system default roles
- `search` - Search in role name
- `hasPermission` - Filter by permission key
- `page` & `limit` - Pagination controls

## 👤 User Management Routes

**Base Path**: `/api/user/users`

| Method   | Endpoint | Description                                         | Status            |
| -------- | -------- | --------------------------------------------------- | ----------------- |
| `GET`    | `/`      | [Get all users](./user-api.md#get-users)            | 🔄 In Development |
| `GET`    | `/stats` | [Get user statistics](./user-api.md#get-user-stats) | 📋 Planned        |
| `GET`    | `/:id`   | [Get user by ID](./user-api.md#get-user-by-id)      | 🔄 In Development |
| `POST`   | `/`      | [Create new user](./user-api.md#create-user)        | 🔄 In Development |
| `PUT`    | `/:id`   | [Update user](./user-api.md#update-user)            | 🔄 In Development |
| `DELETE` | `/:id`   | [Delete user](./user-api.md#delete-user)            | 📋 Planned        |

### Authentication Routes

**Base Path**: `/api/user/auth`

| Method | Endpoint           | Description                                      | Status     |
| ------ | ------------------ | ------------------------------------------------ | ---------- |
| `POST` | `/login`           | [User login](./user-api.md#login)                | 📋 Planned |
| `POST` | `/logout`          | [User logout](./user-api.md#logout)              | 📋 Planned |
| `POST` | `/refresh`         | [Refresh token](./user-api.md#refresh-token)     | 📋 Planned |
| `POST` | `/forgot-password` | [Forgot password](./user-api.md#forgot-password) | 📋 Planned |
| `POST` | `/reset-password`  | [Reset password](./user-api.md#reset-password)   | 📋 Planned |

### Profile Management Routes

**Base Path**: `/api/user/profile`

| Method | Endpoint           | Description                                            | Status     |
| ------ | ------------------ | ------------------------------------------------------ | ---------- |
| `GET`  | `/`                | [Get current user profile](./user-api.md#get-profile)  | 📋 Planned |
| `PUT`  | `/`                | [Update user profile](./user-api.md#update-profile)    | 📋 Planned |
| `POST` | `/change-password` | [Change password](./user-api.md#change-password)       | 📋 Planned |
| `GET`  | `/preferences`     | [Get user preferences](./user-api.md#get-preferences)  | 📋 Planned |
| `PUT`  | `/preferences`     | [Update preferences](./user-api.md#update-preferences) | 📋 Planned |

## 🏗️ Architecture Integration

### Service Layer Integration

```
Routes → Controllers → Services → Database
```

- **Routes**: Define endpoints and middleware
- **Controllers**: Handle HTTP requests/responses
- **Services**: Implement business logic
- **Models**: Define data structures and validation

### Cross-Module Dependencies

```
User Management
├── Depends on: Account Module (PDAccount)
├── Depends on: Lounge Module (for role permissions)
└── Provides: Authentication for all modules
```

## 🔐 Authentication & Authorization

### Route Protection

- **Public Routes**: Login, password reset
- **Authenticated Routes**: Profile management, user operations
- **Admin Routes**: User management, role assignment
- **System Routes**: Permission management, system roles

### Permission Requirements

| Route Category        | Required Permission | Scope   |
| --------------------- | ------------------- | ------- |
| Permission Management | `permission.manage` | Global  |
| Role Management       | `role.manage`       | Account |
| User Management       | `user.manage`       | Account |
| User Creation         | `user.create`       | Account |
| Profile Updates       | `profile.update`    | Self    |

## 📊 Response Formats

### Standard Response Structure

```typescript
// Success Response
{
  "data": [...], // Response data
  "pagination"?: {...}, // For paginated responses
  "meta"?: {...} // Additional metadata
}

// Error Response
{
  "error": "Error message",
  "details": "Detailed error information",
  "code"?: "ERROR_CODE"
}
```

### Pagination Format

```typescript
{
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 125,
    "pages": 13,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## 🚀 API Usage Examples

### Quick Start Examples

```bash
# Get all permissions
GET /api/user/permissions

# Create a new role
POST /api/user/roles
{
  "name": "Manager",
  "accountId": "acc123",
  "permissionKeys": ["user.read", "user.create"]
}

# Get roles for specific account
GET /api/user/roles?accountId=acc123

# Search permissions
GET /api/user/permissions?search=user&category=user
```

### Authentication Example

```bash
# Login (planned)
POST /api/user/auth/login
{
  "username": "john.doe",
  "password": "securePassword123"
}

# Get user profile (planned)
GET /api/user/profile
Authorization: Bearer <jwt-token>
```

## 📈 Status Legend

- ✅ **Active** - Fully implemented and available
- 🔄 **In Development** - Currently being implemented
- 📋 **Planned** - Designed but not yet implemented
- ⚠️ **Deprecated** - Scheduled for removal
- 🚫 **Disabled** - Temporarily unavailable

## 🔗 Related Documentation

- [Permission Architecture](../architecture/permission-architecture.md) - Detailed permission system design
- [Role Architecture](../architecture/role-architecture.md) - Role management architecture
- [User Architecture](../architecture/user-architecture.md) - User system architecture
- [Module Overview](../README.md) - High-level module documentation

---

💡 **Next Steps**: Visit the individual API documentation files for detailed endpoint specifications, request/response examples, and integration guidelines.
