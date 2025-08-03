import { Request, Response } from "express";
import prisma from "../../../config/db";
import {
  CreateRoleInput,
  UpdateRoleInput,
  RoleFilters,
  RolePaginationOptions,
  roleToResponse,
  rolesToResponse,
  RoleValidation,
  isGlobalRole,
  isSystemRole,
  isAccountRole,
  canDeleteRole,
  roleHasPermission,
  DefaultRoleTypes,
} from "../models/role.model";
import { RoleType } from "../../../../generated/prisma";

// Get all roles with optional filtering and pagination
export const getRoles = async (req: Request, res: Response) => {
  try {
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
    } = req.query as Partial<RoleFilters & RolePaginationOptions>;

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
          ...(hasPermission && {
            permission: {
              key: hasPermission,
            },
          }),
          ...(loungeId && { loungeId }),
        },
      };
    }

    // Get roles with relations
    const roles = await prisma.role.findMany({
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
    });

    // Get total count
    const total = await prisma.role.count({ where });

    // Transform to response format
    const response = rolesToResponse(roles as any);

    res.json({
      data: response,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error("Error fetching roles:", error);
    res.status(500).json({ error: "Failed to fetch roles" });
  }
};

// Get role by ID
export const getRoleById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const role = await prisma.role.findUnique({
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

    if (!role) {
      return res.status(404).json({ error: "Role not found" });
    }

    const response = roleToResponse(role as any);
    res.json(response);
  } catch (error) {
    console.error("Error fetching role:", error);
    res.status(500).json({ error: "Failed to fetch role" });
  }
};

// Create new role
export const createRole = async (req: Request, res: Response) => {
  try {
    const {
      name,
      roleType = RoleType.ACCOUNT,
      accountId,
      loungeId,
      permissionIds = [],
    }: CreateRoleInput = req.body;

    // Validate input
    if (!name) {
      return res.status(400).json({
        error: "Name is required",
      });
    }

    // Validate role type specific requirements
    if (roleType === RoleType.ACCOUNT) {
      if (!accountId) {
        return res.status(400).json({
          error: "AccountId is required for ACCOUNT type roles",
        });
      }
      if (!loungeId) {
        return res.status(400).json({
          error: "LoungeId is required for ACCOUNT type roles",
        });
      }
    } else if (roleType === RoleType.GLOBAL) {
      // Global roles don't need accountId or loungeId
      if (accountId) {
        return res.status(400).json({
          error: "AccountId should not be provided for GLOBAL type roles",
        });
      }
    } else if (roleType === RoleType.SYSTEM) {
      // System roles are for internal use only
      return res.status(403).json({
        error: "SYSTEM roles can only be created by system administrators",
      });
    }

    if (
      name.length < RoleValidation.NAME_MIN_LENGTH ||
      name.length > RoleValidation.NAME_MAX_LENGTH
    ) {
      return res.status(400).json({
        error: `Name must be between ${RoleValidation.NAME_MIN_LENGTH} and ${RoleValidation.NAME_MAX_LENGTH} characters`,
      });
    }

    if (RoleValidation.RESERVED_NAMES.includes(name.toLowerCase() as any)) {
      return res.status(400).json({
        error: "Role name is reserved and cannot be used",
      });
    }

    if (permissionIds.length > RoleValidation.MAX_PERMISSIONS) {
      return res.status(400).json({
        error: `Maximum ${RoleValidation.MAX_PERMISSIONS} permissions allowed per role`,
      });
    }

    // Check if account exists for ACCOUNT type roles
    if (roleType === RoleType.ACCOUNT && accountId) {
      const account = await prisma.pDAccount.findUnique({
        where: { id: accountId },
      });

      if (!account) {
        return res.status(404).json({ error: "Account not found" });
      }
    }

    // Check if lounge exists for ACCOUNT type roles
    if (roleType === RoleType.ACCOUNT && loungeId) {
      const lounge = await prisma.lounge.findUnique({
        where: { id: loungeId },
      });

      if (!lounge) {
        return res.status(404).json({ error: "Lounge not found" });
      }
    }

    // Check if role name already exists in scope
    const existingRoleWhere: any = { name };
    if (roleType === RoleType.ACCOUNT) {
      existingRoleWhere.accountId = accountId;
    } else {
      existingRoleWhere.accountId = null;
    }

    const existingRole = await prisma.role.findFirst({
      where: existingRoleWhere,
    });

    if (existingRole) {
      const scope =
        roleType === RoleType.ACCOUNT ? "this account" : "global scope";
      return res.status(409).json({
        error: `Role with this name already exists in ${scope}`,
      });
    }

    // Validate permission IDs if provided
    if (permissionIds.length > 0) {
      const permissions = await prisma.permission.findMany({
        where: {
          id: { in: permissionIds },
        },
      });

      if (permissions.length !== permissionIds.length) {
        return res.status(400).json({
          error: "One or more permission IDs are invalid",
        });
      }
    }

    // Create role with permissions
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

    const role = await prisma.role.create({
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

    const response = roleToResponse(role as any);
    res.status(201).json(response);
  } catch (error) {
    console.error("Error creating role:", error);
    res.status(500).json({ error: "Failed to create role" });
  }
};

// Update role
export const updateRole = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, roleType, permissionIds, loungeId }: UpdateRoleInput =
      req.body;

    // Check if role exists
    const existingRole = await prisma.role.findUnique({
      where: { id },
      include: {
        permissions: true,
        users: true,
      },
    });

    if (!existingRole) {
      return res.status(404).json({ error: "Role not found" });
    }

    // Prevent updating system roles
    if (existingRole.roleType === RoleType.SYSTEM) {
      return res.status(403).json({
        error: "SYSTEM roles cannot be modified",
      });
    }

    // Validate roleType change restrictions
    if (roleType && roleType !== existingRole.roleType) {
      // Don't allow changing to SYSTEM
      if (roleType === RoleType.SYSTEM) {
        return res.status(403).json({
          error: "Cannot change role type to SYSTEM",
        });
      }

      // Don't allow changing from GLOBAL to ACCOUNT if role has users
      if (
        existingRole.roleType === RoleType.GLOBAL &&
        roleType === RoleType.ACCOUNT &&
        existingRole.users.length > 0
      ) {
        return res.status(409).json({
          error:
            "Cannot change GLOBAL role to ACCOUNT role when it has assigned users",
        });
      }
    }

    // Validate name if provided
    if (name) {
      if (
        name.length < RoleValidation.NAME_MIN_LENGTH ||
        name.length > RoleValidation.NAME_MAX_LENGTH
      ) {
        return res.status(400).json({
          error: `Name must be between ${RoleValidation.NAME_MIN_LENGTH} and ${RoleValidation.NAME_MAX_LENGTH} characters`,
        });
      }

      if (RoleValidation.RESERVED_NAMES.includes(name.toLowerCase() as any)) {
        return res.status(400).json({
          error: "Role name is reserved and cannot be used",
        });
      }

      // Check if name already exists in scope (excluding current role)
      const finalRoleType = roleType || existingRole.roleType;
      const existingRoleWhere: any = {
        name,
        id: { not: id },
      };

      if (finalRoleType === RoleType.ACCOUNT) {
        existingRoleWhere.accountId = existingRole.accountId;
      } else {
        existingRoleWhere.accountId = null;
      }

      const duplicateRole = await prisma.role.findFirst({
        where: existingRoleWhere,
      });

      if (duplicateRole) {
        const scope =
          finalRoleType === RoleType.ACCOUNT ? "this account" : "global scope";
        return res.status(409).json({
          error: `Role with this name already exists in ${scope}`,
        });
      }
    }

    // Validate permission IDs if provided
    if (
      permissionIds &&
      permissionIds.length > RoleValidation.MAX_PERMISSIONS
    ) {
      return res.status(400).json({
        error: `Maximum ${RoleValidation.MAX_PERMISSIONS} permissions allowed per role`,
      });
    }

    if (permissionIds && permissionIds.length > 0) {
      const permissions = await prisma.permission.findMany({
        where: {
          id: { in: permissionIds },
        },
      });

      if (permissions.length !== permissionIds.length) {
        return res.status(400).json({
          error: "One or more permission IDs are invalid",
        });
      }
    }

    // Validate loungeId if provided for permission updates
    if (permissionIds && loungeId) {
      const lounge = await prisma.lounge.findUnique({
        where: { id: loungeId },
      });

      if (!lounge) {
        return res.status(404).json({ error: "Lounge not found" });
      }
    }

    // Update role
    const updateData: any = {};
    if (name) updateData.name = name;
    if (roleType) {
      updateData.roleType = roleType;
      // Update accountId based on role type
      if (roleType === RoleType.GLOBAL) {
        updateData.accountId = null;
      }
    }

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

      // If updating to global role or no lounge specified, remove all existing permissions
      if (finalRoleType === RoleType.GLOBAL || !loungeId) {
        await prisma.rolePermission.deleteMany({
          where: { roleId: id },
        });
      } else {
        // Remove existing permissions for this lounge only
        await prisma.rolePermission.deleteMany({
          where: {
            roleId: id,
            loungeId: loungeId,
          },
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

      // Fetch updated role with new permissions
      const updatedRole = await prisma.role.findUnique({
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

      const response = roleToResponse(updatedRole! as any);
      return res.json(response);
    }

    const response = roleToResponse(role as any);
    res.json(response);
  } catch (error) {
    console.error("Error updating role:", error);
    res.status(500).json({ error: "Failed to update role" });
  }
};

// Delete role
export const deleteRole = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if role exists
    const existingRole = await prisma.role.findUnique({
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

    if (!existingRole) {
      return res.status(404).json({ error: "Role not found" });
    }

    // Check if role can be deleted
    if (!canDeleteRole(existingRole as any)) {
      let reason = "Cannot delete role";

      if (isSystemRole(existingRole)) {
        reason = "Cannot delete SYSTEM role";
      } else if (isGlobalRole(existingRole)) {
        reason = "Cannot delete GLOBAL role";
      } else if (existingRole.users.length > 0) {
        reason = "Cannot delete role that has assigned users";
      }

      return res.status(409).json({
        error: reason,
        roleType: existingRole.roleType,
        userCount: existingRole.users.length,
      });
    }

    // Delete role permissions first
    await prisma.rolePermission.deleteMany({
      where: { roleId: id },
    });

    // Delete role
    await prisma.role.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting role:", error);
    res.status(500).json({ error: "Failed to delete role" });
  }
};

// Get roles by account
export const getRolesByAccount = async (req: Request, res: Response) => {
  try {
    const { accountId } = req.params;

    // Check if account exists
    const account = await prisma.pDAccount.findUnique({
      where: { id: accountId },
    });

    if (!account) {
      return res.status(404).json({ error: "Account not found" });
    }

    const roles = await prisma.role.findMany({
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

    const response = rolesToResponse(roles as any);
    res.json(response);
  } catch (error) {
    console.error("Error fetching roles by account:", error);
    res.status(500).json({ error: "Failed to fetch roles by account" });
  }
};

// Get role statistics
export const getRoleStats = async (req: Request, res: Response) => {
  try {
    const { accountId, loungeId } = req.query;

    // Build where clause for stats
    const where: any = {};
    if (accountId) {
      where.accountId = accountId;
    }

    // Get total count
    const total = await prisma.role.count({ where });

    // Get counts by role type
    const globalRoles = await prisma.role.count({
      where: { ...where, roleType: RoleType.GLOBAL },
    });

    const accountRoles = await prisma.role.count({
      where: { ...where, roleType: RoleType.ACCOUNT },
    });

    const systemRoles = await prisma.role.count({
      where: { ...where, roleType: RoleType.SYSTEM },
    });

    // Get roles with user counts
    const roles = await prisma.role.findMany({
      where,
      include: {
        _count: {
          select: { users: true },
        },
      },
    });

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

    res.json({
      total,
      globalRoles,
      accountRoles,
      systemRoles,
      mostUsedRole,
    });
  } catch (error) {
    console.error("Error fetching role stats:", error);
    res.status(500).json({ error: "Failed to fetch role statistics" });
  }
};

// Assign permission to role
export const assignPermissionToRole = async (req: Request, res: Response) => {
  try {
    const { roleId, permissionId, loungeId } = req.body;

    if (!roleId || !permissionId) {
      return res.status(400).json({
        error: "Role ID and Permission ID are required",
      });
    }

    // Check if role exists
    const role = await prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!role) {
      return res.status(404).json({ error: "Role not found" });
    }

    // Check if permission exists
    const permission = await prisma.permission.findUnique({
      where: { id: permissionId },
    });

    if (!permission) {
      return res.status(404).json({ error: "Permission not found" });
    }

    // Validate loungeId for ACCOUNT type roles
    if (role.roleType === RoleType.ACCOUNT) {
      if (!loungeId) {
        return res.status(400).json({
          error: "Lounge ID is required for ACCOUNT type roles",
        });
      }

      const lounge = await prisma.lounge.findUnique({
        where: { id: loungeId },
      });

      if (!lounge) {
        return res.status(404).json({ error: "Lounge not found" });
      }
    } else if (role.roleType === RoleType.GLOBAL && loungeId) {
      return res.status(400).json({
        error: "Lounge ID should not be provided for GLOBAL type roles",
      });
    }

    // Check if assignment already exists
    const existingAssignment = await prisma.rolePermission.findFirst({
      where: {
        roleId,
        permissionId,
        loungeId: role.roleType === RoleType.ACCOUNT ? loungeId : null,
      },
    });

    if (existingAssignment) {
      return res.status(409).json({
        error: "Permission is already assigned to this role",
      });
    }

    // Create assignment
    await prisma.rolePermission.create({
      data: {
        roleId,
        permissionId,
        loungeId: role.roleType === RoleType.ACCOUNT ? loungeId : null,
      },
    });

    res.status(201).json({
      message: "Permission assigned to role successfully",
      roleId,
      permissionId,
      loungeId: role.roleType === RoleType.ACCOUNT ? loungeId : null,
    });
  } catch (error) {
    console.error("Error assigning permission to role:", error);
    res.status(500).json({ error: "Failed to assign permission to role" });
  }
};

// Remove permission from role
export const removePermissionFromRole = async (req: Request, res: Response) => {
  try {
    const { roleId, permissionId, loungeId } = req.params;

    // Check if assignment exists
    const existingAssignment = await prisma.rolePermission.findFirst({
      where: {
        roleId,
        permissionId,
        loungeId: loungeId || null,
      },
    });

    if (!existingAssignment) {
      return res.status(404).json({
        error: "Permission assignment not found",
      });
    }

    // Remove assignment
    await prisma.rolePermission.delete({
      where: {
        roleId_permissionId: {
          roleId,
          permissionId,
        },
      },
    });

    res.status(204).send();
  } catch (error) {
    console.error("Error removing permission from role:", error);
    res.status(500).json({ error: "Failed to remove permission from role" });
  }
};

// Get global roles
export const getGlobalRoles = async (req: Request, res: Response) => {
  try {
    const roles = await prisma.role.findMany({
      where: {
        roleType: RoleType.GLOBAL,
        accountId: null,
      },
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

    const response = rolesToResponse(roles as any);
    res.json(response);
  } catch (error) {
    console.error("Error fetching global roles:", error);
    res.status(500).json({ error: "Failed to fetch global roles" });
  }
};

// Get system roles (admin only)
export const getSystemRoles = async (req: Request, res: Response) => {
  try {
    const roles = await prisma.role.findMany({
      where: { roleType: RoleType.SYSTEM },
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

    const response = rolesToResponse(roles as any);
    res.json(response);
  } catch (error) {
    console.error("Error fetching system roles:", error);
    res.status(500).json({ error: "Failed to fetch system roles" });
  }
};

// Create global role (admin only)
export const createGlobalRole = async (req: Request, res: Response) => {
  try {
    const { name, permissionIds = [] } = req.body;

    if (!name) {
      return res.status(400).json({
        error: "Name is required",
      });
    }

    // Validate name length
    if (
      name.length < RoleValidation.NAME_MIN_LENGTH ||
      name.length > RoleValidation.NAME_MAX_LENGTH
    ) {
      return res.status(400).json({
        error: `Name must be between ${RoleValidation.NAME_MIN_LENGTH} and ${RoleValidation.NAME_MAX_LENGTH} characters`,
      });
    }

    // Check if global role with this name already exists
    const existingRole = await prisma.role.findFirst({
      where: {
        name,
        roleType: RoleType.GLOBAL,
        accountId: null,
      },
    });

    if (existingRole) {
      return res.status(409).json({
        error: "Global role with this name already exists",
      });
    }

    // Validate permission IDs if provided
    if (permissionIds.length > 0) {
      const permissions = await prisma.permission.findMany({
        where: {
          id: { in: permissionIds },
        },
      });

      if (permissions.length !== permissionIds.length) {
        return res.status(400).json({
          error: "One or more permission IDs are invalid",
        });
      }
    }

    // Create global role
    const role = await prisma.role.create({
      data: {
        name,
        roleType: RoleType.GLOBAL,
        accountId: null,
        permissions: {
          create: permissionIds.map((permissionId: string) => ({
            permissionId,
            loungeId: null, // Global permissions don't have lounge association
          })),
        },
      },
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

    const response = roleToResponse(role as any);
    res.status(201).json(response);
  } catch (error) {
    console.error("Error creating global role:", error);
    res.status(500).json({ error: "Failed to create global role" });
  }
};

// Get roles by lounge
export const getRolesByLounge = async (req: Request, res: Response) => {
  try {
    const { loungeId } = req.params;

    // Check if lounge exists
    const lounge = await prisma.lounge.findUnique({
      where: { id: loungeId },
    });

    if (!lounge) {
      return res.status(404).json({ error: "Lounge not found" });
    }

    // Get roles that have permissions for this lounge
    const roles = await prisma.role.findMany({
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

    const response = rolesToResponse(roles as any);
    res.json(response);
  } catch (error) {
    console.error("Error fetching roles by lounge:", error);
    res.status(500).json({ error: "Failed to fetch roles by lounge" });
  }
};

// Check if user can create role (helper for authorization)
export const canCreateRole = async (req: Request, res: Response) => {
  try {
    const { roleType, accountId } = req.query;

    let canCreate = false;
    let message = "";

    switch (roleType) {
      case RoleType.SYSTEM:
        canCreate = false; // Only system admins can create system roles
        message = "SYSTEM roles can only be created by system administrators";
        break;
      case RoleType.GLOBAL:
        canCreate = false; // Only platform admins can create global roles
        message = "GLOBAL roles can only be created by platform administrators";
        break;
      case RoleType.ACCOUNT:
        canCreate = !!accountId; // Need valid account ID
        message = canCreate
          ? "Can create ACCOUNT role"
          : "Valid account ID required";
        break;
      default:
        canCreate = false;
        message = "Invalid role type";
    }

    res.json({
      canCreate,
      message,
      roleType,
      accountId,
    });
  } catch (error) {
    console.error("Error checking role creation permissions:", error);
    res
      .status(500)
      .json({ error: "Failed to check role creation permissions" });
  }
};
