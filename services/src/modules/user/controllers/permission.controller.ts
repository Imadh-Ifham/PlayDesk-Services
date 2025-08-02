import { Request, Response } from "express";
import prisma from "../../../config/db";
import {
  CreatePermissionInput,
  UpdatePermissionInput,
  PermissionFilters,
  PermissionPaginationOptions,
  permissionToResponse,
  permissionsToResponse,
  isValidPermissionKey,
  groupPermissionsByCategory,
  PermissionValidation,
} from "../models/permission.model";

// Get all permissions with optional filtering and pagination
export const getPermissions = async (req: Request, res: Response) => {
  try {
    const {
      search,
      roleId,
      category,
      page = 1,
      limit = 10,
      sortBy = "key",
      sortOrder = "asc",
    } = req.query as Partial<PermissionFilters & PermissionPaginationOptions>;

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { key: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (category) {
      where.key = { startsWith: `${category}.` };
    }

    if (roleId) {
      where.roles = {
        some: {
          roleId: roleId,
        },
      };
    }

    // Get permissions with relations
    const permissions = await prisma.permission.findMany({
      where,
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
      orderBy: { [sortBy]: sortOrder },
      skip,
      take,
    });

    // Get total count
    const total = await prisma.permission.count({ where });

    // Transform to response format
    const response = permissionsToResponse(permissions);

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
    console.error("Error fetching permissions:", error);
    res.status(500).json({ error: "Failed to fetch permissions" });
  }
};

// Get permission by ID
export const getPermissionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const permission = await prisma.permission.findUnique({
      where: { id },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!permission) {
      return res.status(404).json({ error: "Permission not found" });
    }

    const response = permissionToResponse(permission);
    res.json(response);
  } catch (error) {
    console.error("Error fetching permission:", error);
    res.status(500).json({ error: "Failed to fetch permission" });
  }
};

// Create new permission
export const createPermission = async (req: Request, res: Response) => {
  try {
    const { key, name, description }: CreatePermissionInput = req.body;

    // Validate input
    if (!key || !name || !description) {
      return res.status(400).json({
        error: "Key, name, and description are required",
      });
    }

    if (
      key.length < PermissionValidation.KEY_MIN_LENGTH ||
      key.length > PermissionValidation.KEY_MAX_LENGTH
    ) {
      return res.status(400).json({
        error: `Key must be between ${PermissionValidation.KEY_MIN_LENGTH} and ${PermissionValidation.KEY_MAX_LENGTH} characters`,
      });
    }

    if (
      name.length < PermissionValidation.NAME_MIN_LENGTH ||
      name.length > PermissionValidation.NAME_MAX_LENGTH
    ) {
      return res.status(400).json({
        error: `Name must be between ${PermissionValidation.NAME_MIN_LENGTH} and ${PermissionValidation.NAME_MAX_LENGTH} characters`,
      });
    }

    if (
      description.length < PermissionValidation.DESCRIPTION_MIN_LENGTH ||
      description.length > PermissionValidation.DESCRIPTION_MAX_LENGTH
    ) {
      return res.status(400).json({
        error: `Description must be between ${PermissionValidation.DESCRIPTION_MIN_LENGTH} and ${PermissionValidation.DESCRIPTION_MAX_LENGTH} characters`,
      });
    }

    if (!isValidPermissionKey(key)) {
      return res.status(400).json({
        error:
          "Invalid permission key format. Use lowercase letters, numbers, and dots (e.g., user.create)",
      });
    }

    // Check if permission key already exists
    const existingPermission = await prisma.permission.findUnique({
      where: { key },
    });

    if (existingPermission) {
      return res.status(409).json({
        error: "Permission with this key already exists",
      });
    }

    // Create permission
    const permission = await prisma.permission.create({
      data: {
        key,
        name,
        description,
      },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    const response = permissionToResponse(permission);
    res.status(201).json(response);
  } catch (error) {
    console.error("Error creating permission:", error);
    res.status(500).json({ error: "Failed to create permission" });
  }
};

// Update permission
export const updatePermission = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { key, name, description }: UpdatePermissionInput = req.body;

    // Check if permission exists
    const existingPermission = await prisma.permission.findUnique({
      where: { id },
    });

    if (!existingPermission) {
      return res.status(404).json({ error: "Permission not found" });
    }

    // Validate key if provided
    if (key) {
      if (
        key.length < PermissionValidation.KEY_MIN_LENGTH ||
        key.length > PermissionValidation.KEY_MAX_LENGTH
      ) {
        return res.status(400).json({
          error: `Key must be between ${PermissionValidation.KEY_MIN_LENGTH} and ${PermissionValidation.KEY_MAX_LENGTH} characters`,
        });
      }

      if (!isValidPermissionKey(key)) {
        return res.status(400).json({
          error:
            "Invalid permission key format. Use lowercase letters, numbers, and dots (e.g., user.create)",
        });
      }

      // Check if key already exists (excluding current permission)
      const duplicatePermission = await prisma.permission.findUnique({
        where: { key },
      });

      if (duplicatePermission && duplicatePermission.id !== id) {
        return res.status(409).json({
          error: "Permission with this key already exists",
        });
      }
    }

    // Validate name if provided
    if (name) {
      if (
        name.length < PermissionValidation.NAME_MIN_LENGTH ||
        name.length > PermissionValidation.NAME_MAX_LENGTH
      ) {
        return res.status(400).json({
          error: `Name must be between ${PermissionValidation.NAME_MIN_LENGTH} and ${PermissionValidation.NAME_MAX_LENGTH} characters`,
        });
      }
    }

    // Validate description if provided
    if (description) {
      if (
        description.length < PermissionValidation.DESCRIPTION_MIN_LENGTH ||
        description.length > PermissionValidation.DESCRIPTION_MAX_LENGTH
      ) {
        return res.status(400).json({
          error: `Description must be between ${PermissionValidation.DESCRIPTION_MIN_LENGTH} and ${PermissionValidation.DESCRIPTION_MAX_LENGTH} characters`,
        });
      }
    }

    // Update permission
    const permission = await prisma.permission.update({
      where: { id },
      data: {
        ...(key && { key }),
        ...(name && { name }),
        ...(description && { description }),
      },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    const response = permissionToResponse(permission);
    res.json(response);
  } catch (error) {
    console.error("Error updating permission:", error);
    res.status(500).json({ error: "Failed to update permission" });
  }
};

// Delete permission
export const deletePermission = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if permission exists
    const existingPermission = await prisma.permission.findUnique({
      where: { id },
      include: {
        roles: true,
      },
    });

    if (!existingPermission) {
      return res.status(404).json({ error: "Permission not found" });
    }

    // Check if permission is assigned to any roles
    if (existingPermission.roles.length > 0) {
      return res.status(409).json({
        error: "Cannot delete permission that is assigned to roles",
        assignedRoles: existingPermission.roles.length,
      });
    }

    // Delete permission
    await prisma.permission.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting permission:", error);
    res.status(500).json({ error: "Failed to delete permission" });
  }
};

// Get permissions grouped by category
export const getPermissionsByCategory = async (req: Request, res: Response) => {
  try {
    const permissions = await prisma.permission.findMany({
      orderBy: { key: "asc" },
    });

    const groupedPermissions = groupPermissionsByCategory(permissions);

    res.json(groupedPermissions);
  } catch (error) {
    console.error("Error fetching permissions by category:", error);
    res.status(500).json({ error: "Failed to fetch permissions by category" });
  }
};

// Get permission statistics
export const getPermissionStats = async (req: Request, res: Response) => {
  try {
    // Get total count
    const total = await prisma.permission.count();

    // Get permissions with role counts
    const permissions = await prisma.permission.findMany({
      include: {
        _count: {
          select: { roles: true },
        },
      },
    });

    // Find most and least used permissions
    let mostUsed = null;
    let leastUsed = null;

    if (permissions.length > 0) {
      const sorted = permissions.sort(
        (a, b) => b._count.roles - a._count.roles
      );

      mostUsed = {
        id: sorted[0].id,
        key: sorted[0].key,
        roleCount: sorted[0]._count.roles,
      };

      leastUsed = {
        id: sorted[sorted.length - 1].id,
        key: sorted[sorted.length - 1].key,
        roleCount: sorted[sorted.length - 1]._count.roles,
      };
    }

    res.json({
      total,
      mostUsedPermission: mostUsed,
      leastUsedPermission: leastUsed,
    });
  } catch (error) {
    console.error("Error fetching permission stats:", error);
    res.status(500).json({ error: "Failed to fetch permission statistics" });
  }
};
