import prisma from "../../../config/db";
import { RoleType } from "../../../../generated/prisma";
import { CreateRoleInput, RoleValidation } from "../models/role.model";
import { RoleValidationService } from "./role-validation.service";

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

    // Create input for validation
    const createInput: CreateRoleInput = {
      name,
      roleType: RoleType.GLOBAL,
      permissionKeys,
    };

    // Validate input (this will skip lounge validation for global roles)
    await RoleValidationService.validateCreateRoleInput(createInput);

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
