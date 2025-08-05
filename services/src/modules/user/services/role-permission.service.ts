import prisma from "../../../config/db";
import { RoleType } from "../../../../generated/prisma";

export class RolePermissionService {
  static async assignPermission(input: {
    roleId: string;
    permissionId: string;
    loungeId?: string;
  }) {
    const { roleId, permissionId, loungeId } = input;

    // Get role to determine type
    const role = await prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!role) {
      throw new Error("Role not found");
    }

    // Validate permission exists
    const permission = await prisma.permission.findUnique({
      where: { id: permissionId },
    });

    if (!permission) {
      throw new Error("Permission not found");
    }

    // Validate loungeId for ACCOUNT type roles
    if (role.roleType === RoleType.ACCOUNT) {
      if (!loungeId) {
        throw new Error("Lounge ID is required for ACCOUNT type roles");
      }

      const lounge = await prisma.lounge.findUnique({
        where: { id: loungeId },
      });

      if (!lounge) {
        throw new Error("Lounge not found");
      }
    } else if (role.roleType === RoleType.GLOBAL && loungeId) {
      throw new Error("Lounge ID should not be provided for GLOBAL type roles");
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
      throw new Error("Permission is already assigned to this role");
    }

    // Create assignment
    return prisma.rolePermission.create({
      data: {
        roleId,
        permissionId,
        loungeId: role.roleType === RoleType.ACCOUNT ? loungeId : null,
      },
    });
  }

  static async removePermission(input: {
    roleId: string;
    permissionId: string;
    loungeId?: string;
  }) {
    const { roleId, permissionId, loungeId } = input;

    // Check if assignment exists
    const existingAssignment = await prisma.rolePermission.findFirst({
      where: {
        roleId,
        permissionId,
        loungeId: loungeId || null,
      },
    });

    if (!existingAssignment) {
      throw new Error("Permission assignment not found");
    }

    // Remove assignment
    // Remove assignment using the correct composite key (including loungeId if present)
    return prisma.rolePermission.delete({
      where: loungeId !== undefined
        ? {
            roleId_permissionId_loungeId: {
              roleId,
              permissionId,
              loungeId,
            },
          }
        : {
            roleId_permissionId_loungeId: {
              roleId,
              permissionId,
              loungeId: null,
            },
          },
    });
  }
}
