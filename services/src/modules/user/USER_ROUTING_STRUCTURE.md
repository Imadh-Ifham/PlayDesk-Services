# User Module - Centralized Routing Structure

## Overview

Successfully restructured the user module to have **centralized routing** with proper hierarchical organization. All user-related routes now go through a single entry point from the main application.

## Route Structure

### 🎯 **Main Application Level**

```typescript
// app.ts
app.use("/api/user", userRoutes);
```

### 📁 **User Module Routes Index**

```typescript
// /modules/user/routes/index.ts
router.use("/permissions", permissionRoutes); // /api/user/permissions
router.use("/roles", roleRoutes); // /api/user/roles
router.use("/", userRoutes); // /api/user
```

## Complete Route Map

### 👤 **User Routes** - `/api/user`

- `GET /api/user` - Get all users with filtering and pagination
- `GET /api/user/:id` - Get user by ID
- `POST /api/user` - Create new user
- `PUT /api/user/:id` - Update user
- `DELETE /api/user/:id` - Delete user

### 🔐 **Permission Routes** - `/api/user/permissions`

- `GET /api/user/permissions` - Get all permissions with filtering and pagination
- `GET /api/user/permissions/stats` - Get permission statistics
- `GET /api/user/permissions/analytics` - Get permission usage analytics
- `GET /api/user/permissions/categories` - Get permissions grouped by category
- `GET /api/user/permissions/category-stats` - Get category statistics
- `GET /api/user/permissions/:key` - Get permission by key
- `POST /api/user/permissions` - Create new permission
- `PUT /api/user/permissions/:key` - Update permission
- `DELETE /api/user/permissions/:key` - Delete permission

### 👥 **Role Routes** - `/api/user/roles`

- `GET /api/user/roles` - Get all roles with filtering and pagination
- `GET /api/user/roles/stats` - Get role statistics
- `GET /api/user/roles/can-create` - Check if user can create role type
- `GET /api/user/roles/global` - Get global roles
- `GET /api/user/roles/system` - Get system roles (admin only)
- `GET /api/user/roles/account/:accountId` - Get roles by account
- `GET /api/user/roles/lounge/:loungeId` - Get roles by lounge
- `GET /api/user/roles/:id` - Get role by ID
- `POST /api/user/roles` - Create new role (account type)
- `POST /api/user/roles/global` - Create global role (admin only)
- `PUT /api/user/roles/:id` - Update role
- `DELETE /api/user/roles/:id` - Delete role
- `POST /api/user/roles/permissions` - Assign permission to role
- `DELETE /api/user/roles/:roleId/permissions/:permissionId/:loungeId?` - Remove permission from role

## File Structure

### 📂 **Routes Directory**

```
src/modules/user/routes/
├── index.ts              # Main routes aggregator
├── user.routes.ts        # User-specific routes
├── permission.routes.ts  # Permission routes
└── role.routes.ts        # Role routes
```

### 🔗 **Import Chain**

```typescript
app.ts
  → modules/user/routes/index.ts
    → user.routes.ts (for /api/user)
    → permission.routes.ts (for /api/user/permissions)
    → role.routes.ts (for /api/user/roles)
```

## Benefits of Centralized Routing

### 🎯 **Organization**

- **Single Entry Point**: All user module routes go through `/api/user`
- **Logical Grouping**: Related functionality grouped under common paths
- **Scalable Structure**: Easy to add new route categories
- **Clean Separation**: Each route file handles its specific domain

### 🔧 **Maintainability**

- **Centralized Management**: All user routes managed from one index file
- **Consistent Patterns**: Same routing patterns across the module
- **Easy Navigation**: Clear path hierarchy makes debugging easier
- **Version Control**: Changes are isolated to relevant files

### 🚀 **Developer Experience**

- **Predictable URLs**: Consistent `/api/user/{category}` pattern
- **Easy Testing**: Can test each route category independently
- **Clear Documentation**: Route structure is self-documenting
- **Modular Development**: Teams can work on different route files simultaneously

## Route Examples

### 📝 **Permission Management**

```bash
# Get all permissions
GET /api/user/permissions

# Get permission analytics
GET /api/user/permissions/analytics

# Create new permission
POST /api/user/permissions
```

### 👥 **Role Management**

```bash
# Get all roles
GET /api/user/roles

# Get roles for specific lounge
GET /api/user/roles/lounge/lounge-123

# Assign permission to role
POST /api/user/roles/permissions
```

### 👤 **User Management**

```bash
# Get all users
GET /api/user

# Get specific user
GET /api/user/user-123

# Update user
PUT /api/user/user-123
```

## Controller Structure

### 🎛️ **User Controllers**

- `user.controller.ts` - Basic CRUD operations (TODO: Implement)
- `permission.controller.ts` - Permission management
- `permission-query.controller.ts` - Permission analytics
- `role.controller.ts` - Role management
- `role-query.controller.ts` - Role queries
- `role-type.controller.ts` - Role type management
- `role-permission.controller.ts` - Role-permission relationships

## Migration Impact

### ✅ **What Changed**

- **Before**: Direct permission routes at `/api/permissions`
- **After**: Centralized user routes with `/api/user/permissions`
- **Added**: User routes index file for centralized routing
- **Updated**: App.ts to use centralized user routes

### 🔄 **Backward Compatibility**

- Existing permission and role functionality preserved
- Same controller functions and business logic
- Only route paths changed to be more organized

## Future Extensions

### 📈 **Easy to Add**

- `/api/user/profiles` - User profile management
- `/api/user/settings` - User preferences
- `/api/user/authentication` - Auth-related routes
- `/api/user/accounts` - Account management

### 🔧 **Pattern to Follow**

1. Create new route file in `/modules/user/routes/`
2. Add route import to `index.ts`
3. Mount route with `router.use("/{category}", newRoutes)`
4. Update documentation

Your user module now has a **clean, centralized routing structure** that's scalable and maintainable! 🎯
