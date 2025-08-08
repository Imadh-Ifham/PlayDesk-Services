# User Module Documentation

The User Module is a comprehensive authentication and authorization system for the PlayDesk Services application. It manages users, roles, and permissions with a flexible role-based access control (RBAC) system.

## 📚 Documentation Structure

This documentation is organized hierarchically to provide both high-level overviews and detailed technical specifications:

### 🏗️ Architecture Documentation

- **[Permission Architecture](./architecture/permission-architecture.md)** - Detailed modular architecture for permission management
- **[Role Architecture](./architecture/role-architecture.md)** - Comprehensive role management system architecture
- **[User Architecture](./architecture/user-architecture.md)** - User management system design

### 🚀 API Documentation

- **[Complete API Routes](./api/routes-overview.md)** - All user module API endpoints organized by category
- **[Permission API](./api/permission-api.md)** - Detailed permission management endpoints
- **[Role API](./api/role-api.md)** - Comprehensive role management endpoints
- **[User API](./api/user-api.md)** - User management endpoints (in development)

## 🎯 Module Overview

### Core Components

The User Module consists of three main integrated components:

1. **👤 User Management** - User accounts, authentication, and profiles
2. **👥 Role Management** - Hierarchical role system with three tiers (SYSTEM, GLOBAL, ACCOUNT)
3. **🔐 Permission Management** - Granular permissions with category-based organization

### 🏛️ Architecture Principles

- **Modular Architecture**: Each component follows single responsibility principle
- **Service Layer Pattern**: Business logic separated from HTTP handling
- **Multi-tenancy**: Account-scoped roles with lounge-specific permissions
- **Type Safety**: Comprehensive TypeScript interfaces and validation

## �️ Database Schema Overview

### Core Entities

```sql
-- User accounts with status management
User {
  id: CUID (Primary Key)
  username: String (Unique per account)
  email: String (Globally unique, optional)
  password: String (Hashed)
  status: UserStatus (ACTIVE/SUSPENDED/DELETED)
  pdAccountId: UUID (Foreign Key)
  roleId: CUID (Foreign Key)
}

-- Three-tier role system
Role {
  id: CUID (Primary Key)
  name: String (Unique per account/global scope)
  roleType: RoleType (SYSTEM/GLOBAL/ACCOUNT)
  isDefault: Boolean
  accountId: UUID (Foreign Key, null for GLOBAL/SYSTEM)
}

-- Category-based permission system
Permission {
  id: CUID (Primary Key)
  key: String (Globally unique, format: category.action)
  name: String (Human-readable)
  description: String
}

-- Junction table with lounge-specific contexts
RolePermission {
  roleId: CUID (Foreign Key)
  permissionId: CUID (Foreign Key)
  loungeId: UUID (Foreign Key)
  -- Composite Primary Key: [roleId, permissionId, loungeId]
}
```

### Key Relationships

- **Users** belong to **Accounts** and have **Roles**
- **Roles** have many **Permissions** through **RolePermission**
- **Permissions** are assigned per **Lounge** context
- **Accounts** own multiple **Lounges**

## 🔄 Role Hierarchy System

```
SYSTEM Roles
├── Platform administrators only
├── Cannot be created via API
└── Full system access

GLOBAL Roles
├── Platform-wide roles
├── Admin-only creation
└── Cross-account permissions

ACCOUNT Roles
├── Organization-specific
├── Account admin creation
└── Lounge-scoped permissions
```

## � Quick Start Guide

### Base API Routes

All user module endpoints are mounted under `/api/user`:

```bash
# Permission management
GET    /api/user/permissions
POST   /api/user/permissions

# Role management
GET    /api/user/roles
POST   /api/user/roles
POST   /api/user/roles/permissions

# User management (in development)
GET    /api/user/users
POST   /api/user/users
```

### Basic Usage Examples

#### Creating a Permission

```bash
POST /api/user/permissions
{
  "key": "booking.create",
  "name": "Create Bookings",
  "description": "Allows creating new bookings for lounges"
}
```

#### Creating a Role with Permissions

```bash
POST /api/user/roles
{
  "name": "Lounge Manager",
  "roleType": "ACCOUNT",
  "accountId": "acc123",
  "loungeId": "lounge456",
  "permissionKeys": ["user.read", "booking.create", "lounge.manage"]
}
```

#### Filtering and Search

```bash
# Search permissions by category
GET /api/user/permissions?category=user&search=create

# Get roles for specific account
GET /api/user/roles?accountId=acc123&includePermissions=true

# Filter by role type
GET /api/user/roles?roleType=ACCOUNT&page=1&limit=10
```

## 📊 Current Development Status

- ✅ **Permission Management** - Complete with full API
- ✅ **Role Management** - Complete three-tier system with API
- ✅ **Role-Permission Assignment** - Lounge-specific contexts
- 🔄 **User Management** - Core functionality in development
- 📋 **Authentication System** - Planned (login/logout/tokens)
- 📋 **Profile Management** - Planned (user preferences/settings)

## 🔐 Security Features

### Authentication & Authorization

- Password hashing with bcrypt
- JWT-based session management (planned)
- Role-based access control (RBAC)
- Account-scoped user isolation

### Data Protection

- Input validation and sanitization
- SQL injection prevention via Prisma ORM
- Sensitive data encryption
- Audit logging for security events

### Permission System

- Granular permission keys (`category.action`)
- Lounge-specific permission contexts
- Role hierarchy with inheritance
- Dynamic permission resolution

## 📚 Detailed Models Documentation

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

## 🎮 Usage Examples

### Creating a Permission

```typescript
import { createPermission } from "../controllers/permission.controller";

// Create a new permission
const permissionData = {
  key: "booking.create",
  name: "Create Bookings",
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
GET /api/user/permissions?category=user

// Search permissions
GET /api/user/permissions?search=create

// Get permissions for specific role
GET /api/user/permissions?roleId=role123
```

## 📏 Validation Rules

### Permission Keys

- Format: `category.action` (lowercase, dots allowed)
- Examples: `user.create`, `lounge.manage`, `booking.read`
- Length: 3-100 characters
- Must be unique globally

### User Data

- Username: 3-50 characters, unique per account
- Password: Minimum 8 characters
- Email: Valid email format, globally unique (optional)

### Role Data

- Name: 2-50 characters, unique per account
- Maximum 100 permissions per role
- Reserved names: admin, super_admin, system

## 🛡️ Additional Security Features

1. **Password Security**: Passwords are hashed before storage
2. **Multi-tenancy**: Users are scoped to accounts
3. **Role-based Access**: Granular permission system
4. **Input Validation**: Comprehensive validation on all inputs
5. **SQL Injection Prevention**: Using Prisma ORM parameterized queries
6. **Unique Constraints**: Prevent duplicate usernames/emails
7. **Status Management**: Soft delete and suspension capabilities

## 🔗 Quick Links

### 🏗️ Architecture Details

- **[Permission Architecture](./architecture/permission-architecture.md)** - Permission system design
- **[Role Architecture](./architecture/role-architecture.md)** - Role management architecture
- **[User Architecture](./architecture/user-architecture.md)** - User system design

### 🌐 API References

- **[Complete API Routes](./api/routes-overview.md)** - All endpoints organized by category
- **[Permission API](./api/permission-api.md)** - Complete permission endpoints
- **[Role API](./api/role-api.md)** - Complete role endpoints
- **[User API](./api/user-api.md)** - User management endpoints

---

💡 **Note**: This documentation follows a hierarchical structure where this overview provides high-level concepts, while detailed technical specifications are found in the linked architecture and API documents.
