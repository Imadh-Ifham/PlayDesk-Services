import {
  Role,
  User,
  Lounge,
  RolePermission,
  Permission,
  PDAccount,
  RoleType,
} from "../../../../generated/prisma";

// Re-export the Prisma-generated Role type with our extension
export interface RoleModel {
  id: string;
  name: string;
  roleType: RoleType;
  accountId: string | null; // Null for global roles
  createdAt: Date;
  updatedAt: Date;
}

// Role with relations
export interface RoleWithRelations extends RoleModel {
  account: PDAccount | null; // Can be null for global roles
  users?: User[];
  permissions: Array<
    RolePermission & {
      permission: Permission;
      lounge: Lounge | null; // Can be null for global permissions
    }
  >;
}

// Role with permissions (simplified structure)
export interface RoleWithPermissions extends RoleModel {
  permissions: Permission[];
}

// Create role input
export interface CreateRoleInput {
  name: string;
  roleType?: RoleType; // Optional, defaults to ACCOUNT
  accountId?: string | null; // Null for global roles
  loungeId: string; // For the role permissions
  permissionIds?: string[];
}

// Update role input
export interface UpdateRoleInput {
  name?: string;
  roleType?: RoleType;
  permissionIds?: string[];
  loungeId?: string; // For updating role permissions
}

// Role response (public data)
export interface RoleResponse {
  id: string;
  name: string;
  roleType: RoleType;
  accountId: string | null;
  createdAt: Date;
  updatedAt: Date;
  permissions?: Permission[];
  userCount?: number; // Count of users with this role
}

// Role query filters
export interface RoleFilters {
  accountId?: string | null;
  loungeId?: string; // For filtering role permissions by lounge
  roleType?: RoleType;
  search?: string; // For name search
  hasPermission?: string; // Filter by permission key
}

// Role pagination options
export interface RolePaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: "name" | "roleType" | "createdAt" | "updatedAt";
  sortOrder?: "asc" | "desc";
}

// Role statistics
export interface RoleStats {
  total: number;
  globalRoles: number;
  accountRoles: number;
  systemRoles: number;
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
    roleType: role.roleType,
    accountId: role.accountId,
    createdAt: role.createdAt,
    updatedAt: role.updatedAt,
    permissions: role.permissions.map((rp) => rp.permission),
    userCount: role.users?.length || 0,
  };
}

// Helper function to transform multiple roles
export function rolesToResponse(roles: RoleWithRelations[]): RoleResponse[] {
  return roles.map(roleToResponse);
}

// Type guard to check if role is global (accountId is null or roleType is GLOBAL)
export function isGlobalRole(role: RoleModel): boolean {
  return role.accountId === null || role.roleType === RoleType.GLOBAL;
}

// Type guard to check if role is system role
export function isSystemRole(role: RoleModel): boolean {
  return role.roleType === RoleType.SYSTEM;
}

// Type guard to check if role is account-specific
export function isAccountRole(role: RoleModel): boolean {
  return role.roleType === RoleType.ACCOUNT && role.accountId !== null;
}

// Type guard to check if role can be deleted
export function canDeleteRole(role: RoleWithRelations): boolean {
  // System roles and global roles cannot be deleted
  // Also roles with users cannot be deleted
  return (
    !isSystemRole(role) &&
    !isGlobalRole(role) &&
    (role.users?.length || 0) === 0
  );
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
