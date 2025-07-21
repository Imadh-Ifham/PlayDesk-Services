import {
  Role,
  User,
  Lounge,
  RolePermission,
  Permission,
} from "../../../../generated/prisma";

// Re-export the Prisma-generated Role type with our extension
export interface RoleModel {
  id: string;
  name: string;
  isDefault: boolean;
  loungeId: string;
}

// Role with relations
export interface RoleWithRelations extends RoleModel {
  lounge: Lounge;
  users?: User[];
  permissions: Array<RolePermission & { permission: Permission }>;
}

// Role with permissions (simplified structure)
export interface RoleWithPermissions extends RoleModel {
  permissions: Permission[];
}

// Create role input
export interface CreateRoleInput {
  name: string;
  loungeId: string;
  isDefault?: boolean;
  permissionIds?: string[];
}

// Update role input
export interface UpdateRoleInput {
  name?: string;
  isDefault?: boolean;
  permissionIds?: string[];
}

// Role response (public data)
export interface RoleResponse {
  id: string;
  name: string;
  isDefault: boolean;
  loungeId: string;
  permissions?: Permission[];
  userCount?: number; // Count of users with this role
}

// Role query filters
export interface RoleFilters {
  loungeId?: string;
  isDefault?: boolean;
  search?: string; // For name search
  hasPermission?: string; // Filter by permission key
}

// Role pagination options
export interface RolePaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: "name" | "isDefault" | "createdAt";
  sortOrder?: "asc" | "desc";
}

// Role statistics
export interface RoleStats {
  total: number;
  defaultRoles: number;
  customRoles: number;
  mostUsedRole: {
    id: string;
    name: string;
    userCount: number;
  } | null;
}

// Role assignment input
export interface RoleAssignmentInput {
  userId: string;
  roleId: string;
}

// Bulk role assignment input
export interface BulkRoleAssignmentInput {
  userIds: string[];
  roleId: string;
}

// Default role types (common role names)
export enum DefaultRoleTypes {
  ADMIN = "admin",
  MANAGER = "manager",
  EMPLOYEE = "employee",
  CUSTOMER = "customer",
  GUEST = "guest",
}

// Role validation rules
export const RoleValidation = {
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
  MAX_PERMISSIONS: 100, // Reasonable limit
  RESERVED_NAMES: ["admin", "super_admin", "system"], // Names that might be reserved
} as const;

// Helper function to transform Role to RoleResponse
export function roleToResponse(role: RoleWithRelations): RoleResponse {
  return {
    id: role.id,
    name: role.name,
    isDefault: role.isDefault,
    loungeId: role.loungeId,
    permissions: role.permissions.map((rp) => rp.permission),
    userCount: role.users?.length || 0,
  };
}

// Helper function to transform multiple roles
export function rolesToResponse(roles: RoleWithRelations[]): RoleResponse[] {
  return roles.map(roleToResponse);
}

// Type guard to check if role is default
export function isDefaultRole(role: RoleModel): boolean {
  return role.isDefault;
}

// Type guard to check if role can be deleted
export function canDeleteRole(role: RoleWithRelations): boolean {
  // Default roles and roles with users cannot be deleted
  return !role.isDefault && (role.users?.length || 0) === 0;
}

// Helper function to check if role has specific permission
export function roleHasPermission(
  role: RoleWithPermissions,
  permissionKey: string
): boolean {
  return role.permissions.some(
    (permission) => permission.key === permissionKey
  );
}

// Helper function to check if role has any of the specified permissions
export function roleHasAnyPermission(
  role: RoleWithPermissions,
  permissionKeys: string[]
): boolean {
  return role.permissions.some((permission) =>
    permissionKeys.includes(permission.key)
  );
}

// Helper function to check if role has all specified permissions
export function roleHasAllPermissions(
  role: RoleWithPermissions,
  permissionKeys: string[]
): boolean {
  const rolePermissionKeys = role.permissions.map((p) => p.key);
  return permissionKeys.every((key) => rolePermissionKeys.includes(key));
}

// Helper function to get permission keys for a role
export function getRolePermissionKeys(role: RoleWithPermissions): string[] {
  return role.permissions.map((permission) => permission.key);
}
