import prisma from "../../../config/db";
import { RoleType } from "../../../../generated/prisma";
import {
  CreateRoleInput,
  UpdateRoleInput,
  RoleFilters,
  RolePaginationOptions,
  RoleValidation,
  isGlobalRole,
  isSystemRole,
  canDeleteRole,
} from "../models/role.model";

export class RoleService {
  // Core role CRUD operations
  static async findMany(
    filters: Partial<RoleFilters & RolePaginationOptions> = {}
  ) {
    const {
      accountId,
      loungeId,
      roleType,
      search,
      hasPermission,
      page = 1,
      limit = 10,
      sortBy = "name",
      sortOrder = "asc",
    } = filters;

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    // Build where clause
    const where: any = {};

    if (accountId !== undefined) {
      where.accountId = accountId;
    }

    if (roleType) {
      where.roleType = roleType;
    }

    if (search) {
      where.name = { contains: search, mode: "insensitive" };
    }

    if (hasPermission || loungeId) {
      where.permissions = {
        some: {
          ...(hasPermission && (() => {
            // Support hasPermission as "category:action" string or {category, action} object
            if (typeof hasPermission === "string") {
              const [category, action] = hasPermission.split(":");
              return { permission: { category, action } };
            } else if (
              typeof hasPermission === "object" &&
              hasPermission !== null &&
              "category" in hasPermission &&
              "action" in hasPermission
            ) {
              return { permission: { category: hasPermission.category, action: hasPermission.action } };
            }
            return {};
          })()),
          ...(loungeId && { loungeId }),
        },
      };
    }

    const [roles, total] = await Promise.all([
      prisma.role.findMany({
        where,
        include: {
          account: true,
          users: true,
          permissions: {
            include: {
              permission: true,
              lounge: true,
            },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take,
      }),
      prisma.role.count({ where }),
    ]);

    return {
      roles,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    };
  }

  static async findById(id: string) {
    return prisma.role.findUnique({
      where: { id },
      include: {
        account: true,
        users: true,
        permissions: {
          include: {
            permission: true,
            lounge: true,
          },
        },
      },
    });
  }

  static async findByAccount(accountId: string) {
    return prisma.role.findMany({
      where: { accountId },
      include: {
        account: true,
        users: true,
        permissions: {
          include: {
            permission: true,
            lounge: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });
  }

  static async findByLounge(loungeId: string) {
    return prisma.role.findMany({
      where: {
        permissions: {
          some: {
            loungeId: loungeId,
          },
        },
      },
      include: {
        account: true,
        users: true,
        permissions: {
          where: {
            loungeId: loungeId,
          },
          include: {
            permission: true,
            lounge: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });
  }

  static async create(input: CreateRoleInput) {
    const {
      name,
      roleType = RoleType.ACCOUNT,
      accountId,
      loungeId,
      permissionIds = [],
    } = input;

    // Create role data
    const roleData: any = {
      name,
      roleType,
      accountId: roleType === RoleType.ACCOUNT ? accountId : null,
    };

    // Add permissions if provided
    if (permissionIds.length > 0) {
      roleData.permissions = {
        create: permissionIds.map((permissionId) => ({
          permissionId,
          loungeId: roleType === RoleType.ACCOUNT ? loungeId : null,
        })),
      };
    }

    return prisma.role.create({
      data: roleData,
      include: {
        account: true,
        users: true,
        permissions: {
          include: {
            permission: true,
            lounge: true,
          },
        },
      },
    });
  }

  static async update(id: string, input: UpdateRoleInput) {
    const { name, roleType, permissionIds, loungeId } = input;

    // Get existing role
    const existingRole = await prisma.role.findUnique({
      where: { id },
      include: { permissions: true, users: true },
    });

    if (!existingRole) {
      throw new Error("Role not found");
    }

    // Build update data
    const updateData: any = {};
    if (name) updateData.name = name;
    if (roleType) {
      updateData.roleType = roleType;
      if (roleType === RoleType.GLOBAL) {
        updateData.accountId = null;
      }
    }

    // Update role
    const role = await prisma.role.update({
      where: { id },
      data: updateData,
      include: {
        account: true,
        users: true,
        permissions: {
          include: {
            permission: true,
            lounge: true,
          },
        },
      },
    });

    // Update permissions if provided
    if (permissionIds !== undefined) {
      const finalRoleType = roleType || existingRole.roleType;
      const finalLoungeId =
        finalRoleType === RoleType.ACCOUNT ? loungeId : null;

      // Remove existing permissions
      if (finalRoleType === RoleType.GLOBAL || !loungeId) {
        await prisma.rolePermission.deleteMany({
          where: { roleId: id },
        });
      } else {
        await prisma.rolePermission.deleteMany({
          where: { roleId: id, loungeId: loungeId },
        });
      }

      // Add new permissions
      if (permissionIds.length > 0) {
        await prisma.rolePermission.createMany({
          data: permissionIds.map((permissionId) => ({
            roleId: id,
            permissionId,
            loungeId: finalLoungeId,
          })),
        });
      }

      // Return updated role with new permissions
      return this.findById(id);
    }

    return role;
  }

  static async delete(id: string) {
    const existingRole = await this.findById(id);

    if (!existingRole) {
      throw new Error("Role not found");
    }

    if (!canDeleteRole(existingRole as any)) {
      let reason = "Cannot delete role";

      if (isSystemRole(existingRole)) {
        reason = "Cannot delete SYSTEM role";
      } else if (isGlobalRole(existingRole)) {
        reason = "Cannot delete GLOBAL role";
      } else if (existingRole.users.length > 0) {
        reason = "Cannot delete role that has assigned users";
      }

      throw new Error(reason);
    }

    // Delete role permissions first
    await prisma.rolePermission.deleteMany({
      where: { roleId: id },
    });

    // Delete role
    await prisma.role.delete({
      where: { id },
    });
  }

  static async getStats(accountId?: string) {
    const where: any = {};
    if (accountId) {
      where.accountId = accountId;
    }

    const [total, globalRoles, accountRoles, systemRoles, roles] =
      await Promise.all([
        prisma.role.count({ where }),
        prisma.role.count({ where: { ...where, roleType: RoleType.GLOBAL } }),
        prisma.role.count({ where: { ...where, roleType: RoleType.ACCOUNT } }),
        prisma.role.count({ where: { ...where, roleType: RoleType.SYSTEM } }),
        prisma.role.findMany({
          where,
          include: {
            _count: {
              select: { users: true },
            },
          },
        }),
      ]);

    // Find most used role
    let mostUsedRole = null;
    if (roles.length > 0) {
      const sorted = roles.sort((a, b) => b._count.users - a._count.users);
      mostUsedRole = {
        id: sorted[0].id,
        name: sorted[0].name,
        userCount: sorted[0]._count.users,
      };
    }

    return {
      total,
      globalRoles,
      accountRoles,
      systemRoles,
      mostUsedRole,
    };
  }
}
