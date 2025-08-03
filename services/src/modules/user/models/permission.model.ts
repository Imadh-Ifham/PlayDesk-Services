import { Permission, Role, RolePermission } from "../../../../generated/prisma";

// Re-export the Prisma-generated Permission type
export type PermissionModel = Permission;

// Permission with relations
export interface PermissionWithRelations extends Permission {
  roles: Array<RolePermission & { role: Role }>;
}

// Permission with roles (simplified structure)
export interface PermissionWithRoles extends Permission {
  roles: Role[];
}

// Create permission input
export interface CreatePermissionInput {
  category: string;
  action: string;
  name: string;
  description: string;
}

// Update permission input
export interface UpdatePermissionInput {
  key?: string;
  name?: string;
  description?: string;
}

// Permission response (public data)
export interface PermissionResponse {
  id: string;
  key: string;
  name: string;
  description: string;
  roleCount?: number; // Count of roles with this permission
}

// Permission query filters
export interface PermissionFilters {
  search?: string; // For key/description search
  roleId?: string; // Filter by role
  category?: string; // Filter by permission category (e.g., user.*, lounge.*)
}

// Permission pagination options
export interface PermissionPaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: "key" | "description";
  sortOrder?: "asc" | "desc";
}

// Permission statistics
export interface PermissionStats {
  total: number;
  mostUsedPermission: {
    id: string;
    key: string;
    roleCount: number;
  } | null;
  leastUsedPermission: {
    id: string;
    key: string;
    roleCount: number;
  } | null;
}

// Permission assignment input
export interface PermissionAssignmentInput {
  roleId: string;
  permissionId: string;
}

// Bulk permission assignment input
export interface BulkPermissionAssignmentInput {
  roleIds: string[];
  permissionId: string;
}

// Permission categories (grouped by domain)
export enum PermissionCategories {
  USER = "user",
  LOUNGE = "lounge",
  ROLE = "role",
  PERMISSION = "permission",
  BOOKING = "booking",
  MACHINE = "machine",
  SYSTEM = "system",
}

// Common permission actions
export enum PermissionActions {
  CREATE = "create",
  READ = "read",
  UPDATE = "update",
  DELETE = "delete",
  MANAGE = "manage", // Full access
}

// Default permissions structure
export const DefaultPermissions = {
  // User management
  USER_READ: "user.read",
  USER_CREATE: "user.create",
  USER_UPDATE: "user.update",
  USER_DELETE: "user.delete",
  USER_MANAGE: "user.manage",

  // Lounge management
  LOUNGE_READ: "lounge.read",
  LOUNGE_UPDATE: "lounge.update",
  LOUNGE_MANAGE: "lounge.manage",

  // Role management
  ROLE_READ: "role.read",
  ROLE_CREATE: "role.create",
  ROLE_UPDATE: "role.update",
  ROLE_DELETE: "role.delete",
  ROLE_MANAGE: "role.manage",

  // Permission management
  PERMISSION_READ: "permission.read",
  PERMISSION_CREATE: "permission.create",
  PERMISSION_UPDATE: "permission.update",
  PERMISSION_DELETE: "permission.delete",
  PERMISSION_MANAGE: "permission.manage",

  // Booking management
  BOOKING_READ: "booking.read",
  BOOKING_CREATE: "booking.create",
  BOOKING_UPDATE: "booking.update",
  BOOKING_DELETE: "booking.delete",
  BOOKING_MANAGE: "booking.manage",

  // Machine management
  MACHINE_READ: "machine.read",
  MACHINE_CREATE: "machine.create",
  MACHINE_UPDATE: "machine.update",
  MACHINE_DELETE: "machine.delete",
  MACHINE_MANAGE: "machine.manage",

  // System administration
  SYSTEM_ADMIN: "system.admin",
  SYSTEM_CONFIG: "system.config",
} as const;

// Permission validation rules
export const PermissionValidation = {
  KEY_MIN_LENGTH: 3,
  KEY_MAX_LENGTH: 20,
  NAME_MIN_LENGTH: 3,
  NAME_MAX_LENGTH: 50,
  DESCRIPTION_MIN_LENGTH: 5,
  DESCRIPTION_MAX_LENGTH: 255,
  KEY_PATTERN: /^[a-z][a-z0-9]*(\.[a-z][a-z0-9]*)*$/, // e.g., user.create, lounge.manage
} as const;

// Helper function to transform Permission to PermissionResponse
export function permissionToResponse(
  permission: PermissionWithRelations
): PermissionResponse {
  return {
    id: permission.id,
    key: permission.key,
    name: permission.name,
    description: permission.description,
    roleCount: permission.roles?.length || 0,
  };
}

// Helper function to transform multiple permissions
export function permissionsToResponse(
  permissions: PermissionWithRelations[]
): PermissionResponse[] {
  return permissions.map(permissionToResponse);
}

// Helper function to validate permission key format
export function isValidPermissionKeyFormat(key: string): boolean {
  // Must match the pattern and contain only one dot
  if (!PermissionValidation.KEY_PATTERN.test(key)) return false;

  const parts = key.split(".");
  if (parts.length !== 2) return false; // Only one dot allowed: category.action

  return true;
}

// Helper function to get permission category from key
export function getPermissionCategory(key: string): string {
  const parts = key.split(".");
  return parts[0] || "";
}

// Helper function to get permission action from key
export function getPermissionAction(key: string): string {
  const parts = key.split(".");
  return parts[parts.length - 1] || "";
}

// Helper function to check if permission key Category is valid
export function isPermissionCategoryValid(category: string): boolean {
  return Object.values(PermissionCategories).includes(
    category as PermissionCategories
  );
}

// Helper function to check if permission action is valid
export function isPermissionActionValid(action: string): boolean {
  return Object.values(PermissionActions).includes(action as PermissionActions);
}

// Helper function to check if permission is system-level
export function isSystemPermission(key: string): boolean {
  return key.startsWith("system.");
}

// Helper function to group permissions by category
export function groupPermissionsByCategory(
  permissions: Permission[]
): Record<string, Permission[]> {
  return permissions.reduce((groups, permission) => {
    const category = getPermissionCategory(permission.key);
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(permission);
    return groups;
  }, {} as Record<string, Permission[]>);
}

// Helper function to create permission key
export function createPermissionKey(category: string, action: string): string {
  return `${category.toLowerCase()}.${action.toLowerCase()}`;
}

// Helper function to check if permission allows action
export function permissionAllowsAction(
  permissionKey: string,
  requiredAction: string
): boolean {
  // Check exact match
  if (permissionKey === requiredAction) {
    return true;
  }

  // Check if it's a manage permission (allows all actions in category)
  const category = getPermissionCategory(permissionKey);
  const action = getPermissionAction(permissionKey);
  const requiredCategory = getPermissionCategory(requiredAction);

  return category === requiredCategory && action === "manage";
}
