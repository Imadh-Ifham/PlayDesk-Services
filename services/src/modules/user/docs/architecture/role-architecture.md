# Role Management - Modular Architecture

## 🎯 Overview

The Role Management system implements a sophisticated three-tier hierarchical role system (SYSTEM/GLOBAL/ACCOUNT) with comprehensive modular architecture. The system was refactored from a monolithic 1009-line controller into focused, maintainable components.

## 📁 File Structure

```
src/modules/user/
├── services/
│   ├── role.service.ts                    # Core CRUD operations
│   ├── role-type.service.ts              # Role type management (SYSTEM/GLOBAL/ACCOUNT)
│   ├── role-permission.service.ts        # Permission assignment logic
│   └── role-validation.service.ts        # Validation & business rules
├── controllers/
│   ├── role.controller.ts                # Core CRUD operations (6 functions)
│   ├── role-query.controller.ts          # Query operations (3 functions)
│   ├── role-type.controller.ts           # Role type operations (3 functions)
│   └── role-permission.controller.ts     # Permission management (2 functions)
├── models/
│   └── role.model.ts                     # TypeScript interfaces & helpers
└── routes/
    └── role.routes.ts                    # Route definitions
```

## 🏗️ Architecture Layers

### 1. Service Layer (Business Logic)

#### **RoleService** (`role.service.ts`)

- **Responsibility**: Core CRUD operations and business orchestration
- **Key Functions**:
  - `findAll()` - Role retrieval with complex filtering
  - `findById()` - Single role with full relationships
  - `create()` - Role creation with validation
  - `update()` - Role updates with permission handling
  - `delete()` - Safe deletion with dependency checks
  - `getStats()` - Role usage statistics

#### **RoleTypeService** (`role-type.service.ts`)

- **Responsibility**: Three-tier role type management
- **Key Functions**:
  - `findGlobalRoles()` - Platform-wide roles
  - `findSystemRoles()` - Internal platform roles
  - `createGlobalRole()` - Global role creation (admin-only)
  - `validateRoleTypePermissions()` - Type-specific validations

#### **RolePermissionService** (`role-permission.service.ts`)

- **Responsibility**: Role-permission relationship management
- **Key Functions**:
  - `assignPermission()` - Assign permission to role (lounge-scoped)
  - `removePermission()` - Remove permission from role
  - `bulkAssignPermissions()` - Bulk permission operations
  - `validatePermissionAssignment()` - Assignment validation

#### **RoleValidationService** (`role-validation.service.ts`)

- **Responsibility**: Comprehensive validation and business rules
- **Key Functions**:
  - `validateCreateRoleInput()` - Create operation validation
  - `validateUpdateRoleInput()` - Update operation validation
  - `validateRoleNameUnique()` - Scope-based uniqueness
  - `validateAccountExists()` - Account validation
  - `validateLoungeExists()` - Lounge validation
  - `canCreateRoleType()` - Permission checking for role type creation

### 2. Controller Layer (HTTP Handling)

#### **RoleController** (`role.controller.ts`)

- **Responsibility**: Core CRUD HTTP endpoint handling
- **Endpoints**:
  - `GET /api/user/roles` - List with filtering/pagination
  - `GET /api/user/roles/:id` - Get by ID
  - `POST /api/user/roles` - Create role
  - `PUT /api/user/roles/:id` - Update role
  - `DELETE /api/user/roles/:id` - Delete role
  - `GET /api/user/roles/stats` - Role statistics

#### **RoleQueryController** (`role-query.controller.ts`)

- **Responsibility**: Query and filtering endpoint handling
- **Endpoints**:
  - `GET /api/user/roles/account/:accountId` - Roles by account
  - `GET /api/user/roles/lounge/:loungeId` - Roles by lounge
  - `GET /api/user/roles/can-create` - Check creation permissions

#### **RoleTypeController** (`role-type.controller.ts`)

- **Responsibility**: Role type-specific endpoint handling
- **Endpoints**:
  - `GET /api/user/roles/global` - Global roles
  - `GET /api/user/roles/system` - System roles (admin-only)
  - `POST /api/user/roles/global` - Create global role (admin-only)

#### **RolePermissionController** (`role-permission.controller.ts`)

- **Responsibility**: Permission assignment endpoint handling
- **Endpoints**:
  - `POST /api/user/roles/permissions` - Assign permission to role
  - `DELETE /api/user/roles/:roleId/permissions/:permissionId/:loungeId?` - Remove permission

### 3. Model Layer (Data Definitions)

#### **RoleModel** (`role.model.ts`)

- **Responsibility**: TypeScript interfaces and data transformation
- **Key Interfaces**:
  - `RoleModel` - Base role structure with RoleType enum
  - `CreateRoleInput` - Creation data with accountId/loungeId requirements
  - `UpdateRoleInput` - Update data with optional fields
  - `RoleResponse` - Public API response format
  - `RoleFilters` - Complex filtering options
  - `RoleStats` - Statistics and analytics structure

## 🏛️ Three-Tier Role System

### **SYSTEM Roles**

- **Purpose**: Internal platform administration
- **Creation**: Cannot be created via API (database-only)
- **Scope**: Full system access across all accounts and lounges
- **Use Cases**: Platform maintenance, system configuration, global monitoring

### **GLOBAL Roles**

- **Purpose**: Platform-wide administrative roles
- **Creation**: Admin-only via special endpoints
- **Scope**: Cross-account permissions, platform management
- **Use Cases**: Customer support, platform analytics, global configuration

### **ACCOUNT Roles**

- **Purpose**: Organization-specific roles
- **Creation**: Account administrators
- **Scope**: Account-specific with lounge-scoped permissions
- **Use Cases**: Business operations, staff management, lounge administration

## 🔧 Key Features

### Hierarchical Permission Inheritance

```
SYSTEM Roles
├── Full platform access
├── Override all permissions
└── Cannot be modified via API

GLOBAL Roles
├── Cross-account permissions
├── Platform-wide operations
└── Admin-only creation

ACCOUNT Roles
├── Account-scoped operations
├── Lounge-specific permissions
└── Business user creation
```

### Advanced Validation System

- **Scope-based Uniqueness**: Role names unique within their scope
- **Account Validation**: Ensures account exists for ACCOUNT roles
- **Lounge Validation**: Validates lounge context for permissions
- **Permission Limits**: Maximum permissions per role enforcement
- **Reserved Names**: Prevents use of system-reserved role names

### Multi-Context Permission Assignment

- **Lounge-Scoped**: Permissions assigned per lounge context
- **Account-Level**: Some permissions apply to entire account
- **Global Context**: Platform-wide permissions for GLOBAL/SYSTEM roles
- **Dynamic Validation**: Context-aware permission validation

## 🚀 Benefits

### Hierarchical Security Model

- Clear separation of system, platform, and business concerns
- Granular permission control with context awareness
- Scalable multi-tenant architecture
- Flexible role inheritance patterns

### Modular Architecture Benefits

- **Single Responsibility**: Each service handles specific concerns
- **Easy Testing**: Isolated services with clear interfaces
- **Maintainable**: Focused files with clear purposes
- **Extensible**: Easy to add new role types or features

### Advanced Query Capabilities

- **Multi-Filter Support**: Account, lounge, permission-based filtering
- **Performance Optimized**: Efficient database queries with proper indexing
- **Relationship Loading**: Eager loading of related data
- **Statistics Integration**: Built-in analytics and reporting

## 📊 Role Statistics

### Available Metrics

```typescript
{
  total: number,
  byType: {
    SYSTEM: number,
    GLOBAL: number,
    ACCOUNT: number
  },
  byAccount: Record<string, number>,
  averagePermissions: number,
  mostUsedRoles: Array<{id: string, name: string, userCount: number}>
}
```

### Usage Analytics

- Role assignment patterns
- Permission distribution analysis
- Account-wise role usage
- Popular role identification

## 🔄 Migration Benefits

### Before Refactoring

- Single 1009-line monolithic controller
- Mixed business logic and HTTP handling
- Limited role type support
- Basic validation only
- Difficult to test and maintain

### After Refactoring

- 14 focused functions across 4 controllers
- Complete three-tier role system
- Comprehensive validation framework
- Advanced query capabilities
- Modular, testable architecture
- Enhanced security model

## 🔗 Integration Points

### With Permission Management

- Role-permission assignments through junction table
- Lounge-scoped permission contexts
- Bulk permission operations
- Permission validation for role types

### With User Management

- User role assignments
- Role-based access control
- Multi-role user support (future)
- Context-aware permission checking

### With Account System

- Account-scoped role isolation
- Multi-tenant role management
- Account administrator permissions
- Lounge-specific role contexts

## 🛡️ Security Features

### Access Control

- Role type-based creation restrictions
- Account isolation for ACCOUNT roles
- Admin-only operations for GLOBAL/SYSTEM roles
- Context validation for all operations

### Data Integrity

- Referential integrity checks
- Cascade deletion protection
- Unique constraint enforcement
- Business rule validation

---

For detailed API documentation, see [Role API Reference](../api/role-api.md).
