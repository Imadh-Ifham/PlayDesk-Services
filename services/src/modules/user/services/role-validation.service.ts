import prisma from "../../../config/db";
import { RoleType } from "../../../../generated/prisma";

export class RoleValidationService {
  static async validateAccountExists(accountId: string) {
    const account = await prisma.pDAccount.findUnique({
      where: { id: accountId },
    });

    if (!account) {
      throw new Error("Account not found");
    }

    return account;
  }

  static async validateLoungeExists(loungeId: string) {
    const lounge = await prisma.lounge.findUnique({
      where: { id: loungeId },
    });

    if (!lounge) {
      throw new Error("Lounge not found");
    }

    return lounge;
  }

  static async validatePermissionKeys(permissionKeys: string[]) {
    if (permissionKeys.length === 0) return [];

    const permissions = await prisma.permission.findMany({
      where: {
        key: { in: permissionKeys },
      },
    });

    if (permissions.length !== permissionKeys.length) {
      throw new Error("One or more permission keys are invalid");
    }

    return permissions;
  }

  static async validateRoleNameUnique(
    name: string,
    roleType: RoleType,
    accountId?: string | null,
    excludeId?: string
  ) {
    const where: any = { name };

    if (excludeId) {
      where.id = { not: excludeId };
    }

    if (roleType === RoleType.ACCOUNT) {
      where.accountId = accountId;
    } else {
      where.accountId = null;
    }

    const existingRole = await prisma.role.findFirst({ where });

    if (existingRole) {
      const scope =
        roleType === RoleType.ACCOUNT ? "this account" : "global scope";
      throw new Error(`Role with this name already exists in ${scope}`);
    }
  }

  static canCreateRoleType(roleType: RoleType, accountId?: string) {
    switch (roleType) {
      case RoleType.SYSTEM:
        return {
          canCreate: false,
          message: "SYSTEM roles can only be created by system administrators",
        };
      case RoleType.GLOBAL:
        return {
          canCreate: false,
          message:
            "GLOBAL roles can only be created by platform administrators",
        };
      case RoleType.ACCOUNT:
        return {
          canCreate: !!accountId,
          message: accountId
            ? "Can create ACCOUNT role"
            : "Valid account ID required",
        };
      default:
        return {
          canCreate: false,
          message: "Invalid role type",
        };
    }
  }
}
