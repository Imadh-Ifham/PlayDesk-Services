import prisma from "../../../config/db";
import { RoleType } from "../../../../generated/prisma";
import { CreateRoleInput, RoleValidation } from "../models/role.model";

export class GlobalRoleService {
  static async findAll() {
    return prisma.role.findMany({
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
  }

  static async create(input: { name: string; permissionIds?: string[] }) {
    const { name, permissionIds = [] } = input;

    // Validate name length
    if (
      name.length < RoleValidation.NAME_MIN_LENGTH ||
      name.length > RoleValidation.NAME_MAX_LENGTH
    ) {
      throw new Error(
        `Name must be between ${RoleValidation.NAME_MIN_LENGTH} and ${RoleValidation.NAME_MAX_LENGTH} characters`
      );
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
      throw new Error("Global role with this name already exists");
    }

    // Validate permission IDs if provided
    if (permissionIds.length > 0) {
      const permissions = await prisma.permission.findMany({
        where: {
          id: { in: permissionIds },
        },
      });

      if (permissions.length !== permissionIds.length) {
        throw new Error("One or more permission IDs are invalid");
      }
    }

    // Create global role
    return prisma.role.create({
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
  }
}

export class SystemRoleService {
  static async findAll() {
    return prisma.role.findMany({
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
  }
}
