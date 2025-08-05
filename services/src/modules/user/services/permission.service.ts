import prisma from "../../../config/db";
import {
  CreatePermissionInput,
  UpdatePermissionInput,
  PermissionFilters,
  PermissionPaginationOptions,
  permissionToResponse,
  permissionsToResponse,
  groupPermissionsByCategory,
} from "../models/permission.model";
import { PermissionValidationService } from "./permission-validation.service";

export class PermissionService {
  // Find many permissions with filtering and pagination
  static async findMany(
    filters: Partial<PermissionFilters & PermissionPaginationOptions> = {}
  ) {
    const {
      search,
      roleId,
      category,
      page = 1,
      limit = 10,
      sortBy = "key",
      sortOrder = "asc",
    } = filters;

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
    const [permissions, total] = await prisma.$transaction([
      prisma.permission.findMany({
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
      }),
      prisma.permission.count({ where }),
    ]);
    // Transform to response format
    const response = permissionsToResponse(permissions);

    return {
      data: response,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    };
  }

  // Find permission by key
  static async findByKey(key: string) {
    const permission = await prisma.permission.findUnique({
      where: { key },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!permission) {
      throw new Error("Permission not found");
    }

    return permissionToResponse(permission);
  }

  // Create new permission
  static async create(input: CreatePermissionInput) {
    const { category, action, name, description } = input;

    // Validate input
    await PermissionValidationService.validateCreateInput(input);

    // Check if permission key already exists
    await PermissionValidationService.validateKeyUnique(category, action);

    // Create permission
    const permission = await prisma.permission.create({
      data: {
        key: PermissionValidationService.createKey(category, action),
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

    return permissionToResponse(permission);
  }

  // Update permission
  static async update(key: string, input: UpdatePermissionInput) {
    const { name, description } = input;

    // Check if permission exists
    const existingPermission = await prisma.permission.findUnique({
      where: { key },
    });

    if (!existingPermission) {
      throw new Error("Permission not found");
    }

    // Validate update input
    await PermissionValidationService.validateUpdateInput(input);

    // Update permission
    const permission = await prisma.permission.update({
      where: { key },
      data: {
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

    return permissionToResponse(permission);
  }

  // Delete permission
  static async delete(key: string) {
    // Check if permission exists and get role assignments
    const existingPermission = await prisma.permission.findUnique({
      where: { key },
      include: {
        roles: true,
      },
    });

    if (!existingPermission) {
      throw new Error("Permission not found");
    }

    // Check if permission is assigned to any roles
    if (existingPermission.roles.length > 0) {
      throw new Error(
        `Cannot delete permission that is assigned to ${existingPermission.roles.length} role(s)`
      );
    }

    // Delete permission
    await prisma.permission.delete({
      where: { key },
    });

    return {
      key: existingPermission.key,
      message: `Successfully deleted '${existingPermission.key}' permission`,
    };
  }

  // Get all permissions (for category grouping)
  static async findAll() {
    return await prisma.permission.findMany({
      orderBy: { key: "asc" },
    });
  }

  // Get permissions grouped by category
  static async findByCategory() {
    const permissions = await this.findAll();
    return groupPermissionsByCategory(permissions);
  }
}
