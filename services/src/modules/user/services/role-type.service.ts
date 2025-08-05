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

  static async create(input: { name: string; permissionKeys?: string[] }) {
    const { name, permissionKeys = [] } = input;

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

    // Validate permission keys if provided
    if (permissionKeys.length > 0) {
      const permissions = await prisma.permission.findMany({
        where: {
          key: { in: permissionKeys },
        },
      });

      if (permissions.length !== permissionKeys.length) {
        throw new Error("One or more permission keys are invalid");
      }
    }

    // Create global role
    return prisma.role.create({
      data: {
        name,
        roleType: RoleType.GLOBAL,
        accountId: null,
        permissions: {
          create: permissionKeys.map((permissionKey: string) => ({
            permissionKey,
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
