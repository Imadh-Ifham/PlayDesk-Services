# User Management API

Comprehensive API documentation for user management endpoints in the User Module. This includes user CRUD operations, authentication, and profile management.

## 📋 Overview

The User API provides complete user lifecycle management for the PlayDesk system. Users are account-scoped with role-based permissions and support for multiple authentication methods.

**Base Path**: `/api/user/users`

⚠️ **Development Status**: The User Management system is currently under active development. Some endpoints are planned but not yet implemented.

## 🏗️ User System Architecture

### User Status Management

```typescript
enum UserStatus {
  ACTIVE = "ACTIVE", // Normal active user
  SUSPENDED = "SUSPENDED", // Temporarily disabled
  DELETED = "DELETED", // Soft deleted user
}
```

### Account Integration

- **Account Scoping**: Users belong to specific accounts
- **Username Uniqueness**: Unique within account scope
- **Email Uniqueness**: Global email uniqueness
- **Role Assignment**: Single role per user

## 🔗 Quick Navigation

### Core User Management

- [Get Users](#get-users) - List with filtering and pagination
- [Get User Stats](#get-user-stats) - User statistics
- [Get User by ID](#get-user-by-id) - Single user details
- [Create User](#create-user) - Create new user
- [Update User](#update-user) - Modify existing user
- [Delete User](#delete-user) - Soft delete user

### Authentication

- [Login](#login) - User authentication
- [Logout](#logout) - Session termination
- [Refresh Token](#refresh-token) - Token renewal
- [Forgot Password](#forgot-password) - Password reset initiation
- [Reset Password](#reset-password) - Password reset completion

### Profile Management

- [Get Profile](#get-profile) - Current user profile
- [Update Profile](#update-profile) - Profile modifications
- [Change Password](#change-password) - Password updates
- [Get Preferences](#get-preferences) - User preferences
- [Update Preferences](#update-preferences) - Preference modifications

## 📚 Core User Management Endpoints

### Get Users

Retrieve all users with advanced filtering, search, and pagination capabilities.

**Endpoint**: `GET /api/user/users`
**Status**: 🔄 In Development

#### Query Parameters

| Parameter        | Type    | Description                                    | Default    | Example               |
| ---------------- | ------- | ---------------------------------------------- | ---------- | --------------------- |
| `accountId`      | string  | Filter by account ID                           | -          | `acc123`              |
| `roleId`         | string  | Filter by role assignment                      | -          | `role456`             |
| `status`         | string  | Filter by user status                          | -          | `ACTIVE`, `SUSPENDED` |
| `search`         | string  | Search in username/email                       | -          | `john`                |
| `page`           | number  | Page number for pagination                     | `1`        | `2`                   |
| `limit`          | number  | Items per page (max 100)                       | `10`       | `25`                  |
| `sortBy`         | string  | Sort field (`username`, `createdAt`, `status`) | `username` | `createdAt`           |
| `sortOrder`      | string  | Sort direction (`asc`, `desc`)                 | `asc`      | `desc`                |
| `includeRole`    | boolean | Include role details                           | `true`     | `false`               |
| `includeAccount` | boolean | Include account details                        | `true`     | `false`               |

#### Example Request

```bash
GET /api/user/users?accountId=acc123&status=ACTIVE&search=john&page=1&limit=10
```

#### Response Format

```typescript
{
  "data": [
    {
      "id": "user123",
      "username": "john.doe",
      "email": "john@downtown-gaming.com",
      "status": "ACTIVE",
      "pdAccountId": "acc123",
      "roleId": "role456",
      "account": {
        "id": "acc123",
        "name": "Downtown Gaming Center",
        "email": "contact@downtown-gaming.com"
      },
      "role": {
        "id": "role456",
        "name": "Gaming Floor Supervisor",
        "roleType": "ACCOUNT",
        "permissionCount": 8
      },
      "lastLoginAt": "2025-08-08T08:30:00Z",
      "createdAt": "2025-08-07T10:30:00Z",
      "updatedAt": "2025-08-08T08:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "pages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

### Get User Stats

Retrieve user system statistics and analytics.

**Endpoint**: `GET /api/user/users/stats`
**Status**: 📋 Planned

#### Response Format

```typescript
{
  "data": {
    "totalUsers": 234,
    "byStatus": {
      "ACTIVE": 201,
      "SUSPENDED": 5,
      "DELETED": 28
    },
    "byAccount": {
      "acc123": 45,
      "acc456": 32,
      "acc789": 67
    },
    "byRole": {
      "Employee": 145,
      "Manager": 23,
      "Admin": 8,
      "Customer": 58
    },
    "loginActivity": {
      "dailyActive": 78,
      "weeklyActive": 156,
      "monthlyActive": 201,
      "neverLoggedIn": 12
    },
    "recentActivity": {
      "created": 8,
      "activated": 3,
      "suspended": 1,
      "deleted": 2,
      "passwordChanges": 5
    },
    "trends": {
      "newUsersLast30Days": 23,
      "loginGrowthRate": 12.5,
      "accountDistribution": "even"
    }
  }
}
```

---

### Get User by ID

Retrieve detailed information about a specific user.

**Endpoint**: `GET /api/user/users/:id`
**Status**: 🔄 In Development

#### Path Parameters

| Parameter | Type   | Description    |
| --------- | ------ | -------------- |
| `id`      | string | User ID (CUID) |

#### Query Parameters

| Parameter         | Type    | Description                  | Default |
| ----------------- | ------- | ---------------------------- | ------- |
| `includeRole`     | boolean | Include role and permissions | `true`  |
| `includeAccount`  | boolean | Include account details      | `true`  |
| `includeActivity` | boolean | Include activity log         | `false` |

#### Example Request

```bash
GET /api/user/users/user123?includeRole=true&includeActivity=true
```

#### Response Format

```typescript
{
  "data": {
    "id": "user123",
    "username": "john.doe",
    "email": "john@downtown-gaming.com",
    "status": "ACTIVE",
    "pdAccountId": "acc123",
    "roleId": "role456",
    "account": {
      "id": "acc123",
      "name": "Downtown Gaming Center",
      "email": "contact@downtown-gaming.com",
      "status": "ACTIVE"
    },
    "role": {
      "id": "role456",
      "name": "Gaming Floor Supervisor",
      "roleType": "ACCOUNT",
      "permissions": [
        {
          "key": "user.read",
          "name": "Read Users",
          "description": "View user information"
        }
      ]
    },
    "profile": {
      "firstName": "John",
      "lastName": "Doe",
      "phone": "+1234567890",
      "preferences": {
        "language": "en",
        "timezone": "America/New_York",
        "notifications": true
      }
    },
    "activity": [
      {
        "action": "login",
        "timestamp": "2025-08-08T08:30:00Z",
        "ipAddress": "192.168.1.100"
      }
    ],
    "lastLoginAt": "2025-08-08T08:30:00Z",
    "createdAt": "2025-08-07T10:30:00Z",
    "updatedAt": "2025-08-08T08:30:00Z"
  }
}
```

---

### Create User

Create a new user account with role assignment.

**Endpoint**: `POST /api/user/users`
**Status**: 🔄 In Development

#### Request Body

```typescript
{
  "username": "jane.smith",
  "email": "jane@downtown-gaming.com",
  "password": "SecurePassword123!",
  "pdAccountId": "acc123",
  "roleId": "role456",
  "profile": {
    "firstName": "Jane",
    "lastName": "Smith",
    "phone": "+1234567891"
  }
}
```

#### Validation Rules

- **username**: 3-50 characters, unique per account, alphanumeric + dots/underscores
- **email**: Valid email format, globally unique (optional)
- **password**: Minimum 8 characters, must include uppercase, lowercase, number
- **pdAccountId**: Must exist and be active
- **roleId**: Must exist and belong to the same account

#### Example Request

```bash
POST /api/user/users
Content-Type: application/json

{
  "username": "jane.supervisor",
  "email": "jane.supervisor@downtown-gaming.com",
  "password": "SecurePass123!",
  "pdAccountId": "acc123",
  "roleId": "role456",
  "profile": {
    "firstName": "Jane",
    "lastName": "Smith",
    "phone": "+1234567891"
  }
}
```

#### Response Format

```typescript
{
  "data": {
    "id": "user789",
    "username": "jane.supervisor",
    "email": "jane.supervisor@downtown-gaming.com",
    "status": "ACTIVE",
    "pdAccountId": "acc123",
    "roleId": "role456",
    "account": {
      "id": "acc123",
      "name": "Downtown Gaming Center"
    },
    "role": {
      "id": "role456",
      "name": "Gaming Floor Supervisor",
      "roleType": "ACCOUNT"
    },
    "profile": {
      "firstName": "Jane",
      "lastName": "Smith",
      "phone": "+1234567891"
    },
    "createdAt": "2025-08-08T10:00:00Z",
    "updatedAt": "2025-08-08T10:00:00Z"
  }
}
```

#### Error Responses

```typescript
// Username already exists
{
  "error": "Username already exists",
  "details": "A user with this username already exists in this account"
}

// Email already exists
{
  "error": "Email already in use",
  "details": "This email address is already registered"
}

// Weak password
{
  "error": "Password validation failed",
  "details": "Password must contain uppercase, lowercase, number, and be at least 8 characters"
}
```

---

### Update User

Update an existing user's information and settings.

**Endpoint**: `PUT /api/user/users/:id`
**Status**: 🔄 In Development

#### Path Parameters

| Parameter | Type   | Description    |
| --------- | ------ | -------------- |
| `id`      | string | User ID (CUID) |

#### Request Body

```typescript
{
  "email": "john.doe.updated@downtown-gaming.com",
  "roleId": "role789",
  "status": "ACTIVE",
  "profile": {
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890"
  }
}
```

#### Example Request

```bash
PUT /api/user/users/user123
Content-Type: application/json

{
  "email": "john.senior@downtown-gaming.com",
  "roleId": "role789",
  "profile": {
    "firstName": "John",
    "lastName": "Senior",
    "phone": "+1234567890"
  }
}
```

#### Response Format

```typescript
{
  "data": {
    "id": "user123",
    "username": "john.doe",
    "email": "john.senior@downtown-gaming.com",
    "status": "ACTIVE",
    "pdAccountId": "acc123",
    "roleId": "role789",
    "profile": {
      "firstName": "John",
      "lastName": "Senior",
      "phone": "+1234567890"
    },
    "updatedAt": "2025-08-08T10:30:00Z"
  }
}
```

---

### Delete User

Soft delete a user account (sets status to DELETED).

**Endpoint**: `DELETE /api/user/users/:id`
**Status**: 📋 Planned

#### Path Parameters

| Parameter | Type   | Description    |
| --------- | ------ | -------------- |
| `id`      | string | User ID (CUID) |

#### Response Format

```typescript
{
  "data": {
    "message": "User deleted successfully",
    "deletedUser": {
      "id": "user123",
      "username": "john.doe",
      "status": "DELETED",
      "deletedAt": "2025-08-08T10:45:00Z"
    }
  }
}
```

## 🔐 Authentication Endpoints

### Login

Authenticate a user and establish a session.

**Endpoint**: `POST /api/user/auth/login`
**Status**: 📋 Planned

#### Request Body

```typescript
{
  "username": "john.doe",
  "password": "SecurePassword123!",
  "accountId": "acc123" // Optional if username is globally unique
}
```

#### Response Format

```typescript
{
  "data": {
    "user": {
      "id": "user123",
      "username": "john.doe",
      "email": "john@downtown-gaming.com",
      "status": "ACTIVE",
      "role": {
        "id": "role456",
        "name": "Gaming Floor Supervisor",
        "permissions": ["user.read", "booking.create"]
      }
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIs...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
      "expiresIn": 3600
    },
    "session": {
      "id": "session123",
      "expiresAt": "2025-08-08T14:00:00Z"
    }
  }
}
```

---

### Logout

Terminate a user session.

**Endpoint**: `POST /api/user/auth/logout`
**Status**: 📋 Planned

#### Headers

```bash
Authorization: Bearer <access-token>
```

#### Response Format

```typescript
{
  "data": {
    "message": "Logout successful",
    "sessionId": "session123",
    "loggedOutAt": "2025-08-08T11:00:00Z"
  }
}
```

---

### Refresh Token

Refresh an expired access token.

**Endpoint**: `POST /api/user/auth/refresh`
**Status**: 📋 Planned

#### Request Body

```typescript
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

#### Response Format

```typescript
{
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 3600
  }
}
```

## 👤 Profile Management Endpoints

### Get Profile

Get the current authenticated user's profile.

**Endpoint**: `GET /api/user/profile`
**Status**: 📋 Planned

#### Headers

```bash
Authorization: Bearer <access-token>
```

#### Response Format

```typescript
{
  "data": {
    "id": "user123",
    "username": "john.doe",
    "email": "john@downtown-gaming.com",
    "profile": {
      "firstName": "John",
      "lastName": "Doe",
      "phone": "+1234567890",
      "avatar": "https://cdn.example.com/avatars/user123.jpg"
    },
    "account": {
      "id": "acc123",
      "name": "Downtown Gaming Center"
    },
    "role": {
      "name": "Gaming Floor Supervisor",
      "permissions": ["user.read", "booking.create"]
    },
    "preferences": {
      "language": "en",
      "timezone": "America/New_York",
      "notifications": true
    },
    "lastLoginAt": "2025-08-08T08:30:00Z"
  }
}
```

---

### Update Profile

Update the current user's profile information.

**Endpoint**: `PUT /api/user/profile`
**Status**: 📋 Planned

#### Request Body

```typescript
{
  "profile": {
    "firstName": "John",
    "lastName": "Smith",
    "phone": "+1234567891"
  },
  "preferences": {
    "language": "en",
    "timezone": "America/Chicago",
    "notifications": false
  }
}
```

#### Response Format

```typescript
{
  "data": {
    "id": "user123",
    "profile": {
      "firstName": "John",
      "lastName": "Smith",
      "phone": "+1234567891"
    },
    "preferences": {
      "language": "en",
      "timezone": "America/Chicago",
      "notifications": false
    },
    "updatedAt": "2025-08-08T11:15:00Z"
  }
}
```

---

### Change Password

Change the current user's password.

**Endpoint**: `POST /api/user/profile/change-password`
**Status**: 📋 Planned

#### Request Body

```typescript
{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewSecurePassword456!",
  "confirmPassword": "NewSecurePassword456!"
}
```

#### Response Format

```typescript
{
  "data": {
    "message": "Password changed successfully",
    "changedAt": "2025-08-08T11:30:00Z"
  }
}
```

## 🔐 Authentication & Authorization

### Required Permissions

| Endpoint            | Required Permission | Scope   |
| ------------------- | ------------------- | ------- |
| `GET /users`        | `user.read`         | Account |
| `GET /users/:id`    | `user.read`         | Account |
| `POST /users`       | `user.create`       | Account |
| `PUT /users/:id`    | `user.update`       | Account |
| `DELETE /users/:id` | `user.delete`       | Account |
| `GET /profile`      | `profile.read`      | Self    |
| `PUT /profile`      | `profile.update`    | Self    |

### Security Features

- **Password Hashing**: Bcrypt with salt rounds
- **Session Management**: JWT-based authentication
- **Account Isolation**: Users scoped to accounts
- **Role-based Access**: Permission-driven operations
- **Input Validation**: Comprehensive data validation
- **Audit Logging**: User activity tracking

## 📊 Best Practices

### Username Conventions

```typescript
// Good usernames
"john.doe"; // Clear identification
"jane.supervisor"; // Role indication
"mike.vip.host"; // Detailed context

// Avoid
"user123"; // Non-descriptive
"admin"; // Too generic
"j.d"; // Too short
```

### Password Policies

```typescript
const passwordRequirements = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  preventCommonPasswords: true,
  preventUsernameInPassword: true,
};
```

## 🔗 Related Documentation

- [Role API](./role-api.md) - Role management for user assignments
- [Permission API](./permission-api.md) - Permission system integration
- [User Architecture](../architecture/user-architecture.md) - Detailed system design
- [Routes Overview](./routes-overview.md) - Complete API overview

---

💡 **Development Status**: User management endpoints are actively being developed. Check the [User Architecture](../architecture/user-architecture.md) for implementation progress and planned features.
