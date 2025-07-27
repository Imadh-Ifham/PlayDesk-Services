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
  isDefaultRole,
  canDeleteRole,
  roleHasPermission,
  DefaultRoleTypes,
} from "../models/role.model";

// Get all roles with optional filtering and pagination
export const getRoles = async (req: Request, res: Response) => {
  try {
    const {
      loungeId,
      isDefault,
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

    if (loungeId) {
      where.loungeId = loungeId;
    }

    if (typeof isDefault === "string") {
      where.isDefault = isDefault === "true";
    }

    if (search) {
      where.name = { contains: search, mode: "insensitive" };
    }

    if (hasPermission) {
      where.permissions = {
        some: {
          permission: {
            key: hasPermission,
          },
        },
      };
    }

    // Get roles with relations
    const roles = await prisma.role.findMany({
      where,
      include: {
        lounge: true,
        users: true,
        permissions: {
          include: {
            permission: true,
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
    const response = rolesToResponse(roles);

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
        lounge: true,
        users: true,
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    if (!role) {
      return res.status(404).json({ error: "Role not found" });
    }

    const response = roleToResponse(role);
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
      loungeId,
      isDefault = false,
      permissionIds = [],
    }: CreateRoleInput = req.body;

    // Validate input
    if (!name || !loungeId) {
      return res.status(400).json({
        error: "Name and loungeId are required",
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

    // Check if lounge exists
    const lounge = await prisma.lounge.findUnique({
      where: { id: loungeId },
    });

    if (!lounge) {
      return res.status(404).json({ error: "Lounge not found" });
    }

    // Check if role name already exists in this lounge
    const existingRole = await prisma.role.findFirst({
      where: {
        name,
        loungeId,
      },
    });

    if (existingRole) {
      return res.status(409).json({
        error: "Role with this name already exists in this lounge",
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
    const role = await prisma.role.create({
      data: {
        name,
        loungeId,
        isDefault,
        permissions: {
          create: permissionIds.map((permissionId) => ({
            permissionId,
          })),
        },
      },
      include: {
        lounge: true,
        users: true,
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    const response = roleToResponse(role);
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
    const { name, isDefault, permissionIds }: UpdateRoleInput = req.body;

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

      // Check if name already exists in this lounge (excluding current role)
      const duplicateRole = await prisma.role.findFirst({
        where: {
          name,
          loungeId: existingRole.loungeId,
          id: { not: id },
        },
      });

      if (duplicateRole) {
        return res.status(409).json({
          error: "Role with this name already exists in this lounge",
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

    // Update role
    const updateData: any = {};
    if (name) updateData.name = name;
    if (typeof isDefault === "boolean") updateData.isDefault = isDefault;

    const role = await prisma.role.update({
      where: { id },
      data: updateData,
      include: {
        lounge: true,
        users: true,
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    // Update permissions if provided
    if (permissionIds) {
      // Remove existing permissions
      await prisma.rolePermission.deleteMany({
        where: { roleId: id },
      });

      // Add new permissions
      if (permissionIds.length > 0) {
        await prisma.rolePermission.createMany({
          data: permissionIds.map((permissionId) => ({
            roleId: id,
            permissionId,
          })),
        });
      }

      // Fetch updated role with new permissions
      const updatedRole = await prisma.role.findUnique({
        where: { id },
        include: {
          lounge: true,
          users: true,
          permissions: {
            include: {
              permission: true,
            },
          },
        },
      });

      const response = roleToResponse(updatedRole!);
      return res.json(response);
    }

    const response = roleToResponse(role);
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
        lounge: true,
        users: true,
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    if (!existingRole) {
      return res.status(404).json({ error: "Role not found" });
    }

    // Check if role can be deleted
    if (!canDeleteRole(existingRole)) {
      const reason = existingRole.isDefault
        ? "Cannot delete default role"
        : "Cannot delete role that has assigned users";

      return res.status(409).json({
        error: reason,
        isDefault: existingRole.isDefault,
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

    const roles = await prisma.role.findMany({
      where: { loungeId },
      include: {
        lounge: true,
        users: true,
        permissions: {
          include: {
            permission: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });

    const response = rolesToResponse(roles);
    res.json(response);
  } catch (error) {
    console.error("Error fetching roles by lounge:", error);
    res.status(500).json({ error: "Failed to fetch roles by lounge" });
  }
};

// Get role statistics
export const getRoleStats = async (req: Request, res: Response) => {
  try {
    const { loungeId } = req.query;

    // Build where clause for stats
    const where: any = {};
    if (loungeId) {
      where.loungeId = loungeId;
    }

    // Get total count
    const total = await prisma.role.count({ where });

    // Get default roles count
    const defaultRoles = await prisma.role.count({
      where: { ...where, isDefault: true },
    });

    const customRoles = total - defaultRoles;

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
      defaultRoles,
      customRoles,
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
    const { roleId, permissionId } = req.body;

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

    // Check if assignment already exists
    const existingAssignment = await prisma.rolePermission.findUnique({
      where: {
        roleId_permissionId: {
          roleId,
          permissionId,
        },
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
      },
    });

    res.status(201).json({
      message: "Permission assigned to role successfully",
      roleId,
      permissionId,
    });
  } catch (error) {
    console.error("Error assigning permission to role:", error);
    res.status(500).json({ error: "Failed to assign permission to role" });
  }
};

// Remove permission from role
export const removePermissionFromRole = async (req: Request, res: Response) => {
  try {
    const { roleId, permissionId } = req.params;

    // Check if assignment exists
    const existingAssignment = await prisma.rolePermission.findUnique({
      where: {
        roleId_permissionId: {
          roleId,
          permissionId,
        },
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
