import prisma from "../../../config/db";
import { RoleType } from "../../../../generated/prisma";
import {
  CreateRoleInput,
  RoleValidation,
  isValidRoleType,
} from "../models/role.model";

/**
 * Service class responsible for validating role-related operations
 * Handles input validation, database constraint checking, and business rule validation
 */
export class RoleValidationService {
  /**
   * Validates input data for creating a new role
   * Performs both client-side validation and database constraint validation
   *
   * @param input - The role creation input data to validate
   * @returns Promise<true> if validation passes
   * @throws Error if validation fails with detailed error messages
   */
  static async validateCreateRoleInput(input: CreateRoleInput) {
    const errors: string[] = [];

    // Validate name field requirements
    if (!input.name || typeof input.name !== "string") {
      errors.push("Name is required and must be a string");
    } else {
      // Check minimum length requirement
      if (input.name.length < RoleValidation.NAME_MIN_LENGTH) {
        errors.push(
          `Name must be at least ${RoleValidation.NAME_MIN_LENGTH} characters long`
        );
      }
      // Check maximum length requirement
      if (input.name.length > RoleValidation.NAME_MAX_LENGTH) {
        errors.push(
          `Name must be no more than ${RoleValidation.NAME_MAX_LENGTH} characters long`
        );
      }
      // Check against reserved names list
      if (
        (RoleValidation.RESERVED_NAMES as readonly string[]).includes(
          input.name.toLowerCase()
        )
      ) {
        errors.push(`Name '${input.name}' is reserved and cannot be used`);
      }
    }

    // Validate roleType enum value
    if (input.roleType !== undefined && !isValidRoleType(input.roleType)) {
      errors.push("Invalid role type. Must be SYSTEM, GLOBAL, or ACCOUNT");
    }

    // Validate accountId requirements based on role type
    const roleType = input.roleType || RoleType.ACCOUNT; // Default is ACCOUNT
    if (roleType === RoleType.ACCOUNT && !input.accountId) {
      errors.push("Account ID is required for ACCOUNT type roles");
    }
    if (roleType !== RoleType.ACCOUNT && input.accountId) {
      errors.push(
        "Account ID should not be provided for GLOBAL or SYSTEM roles"
      );
    }

    // Validate permission assignment requirements
    if (input.permissionKeys && input.permissionKeys.length > 0) {
      // ACCOUNT roles need a lounge context for permissions
      if (roleType === RoleType.ACCOUNT && !input.loungeId) {
        errors.push(
          "Lounge ID is required when assigning permissions to ACCOUNT roles"
        );
      }
      // Note: We don't enforce "should not provide loungeId" for global/system roles
      // as the service layer will ignore it anyway

      // Check permission count limit
      if (input.permissionKeys.length > RoleValidation.MAX_PERMISSIONS) {
        errors.push(
          `Cannot assign more than ${RoleValidation.MAX_PERMISSIONS} permissions to a role`
        );
      }
    }

    // If basic validation fails, throw error early to avoid unnecessary database calls
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(", ")}`);
    }

    // Perform database constraint validations

    // Validate account exists for ACCOUNT roles
    if (roleType === RoleType.ACCOUNT && input.accountId) {
      await this.validateAccountExists(input.accountId);
    }

    // Validate lounge exists if provided and needed for ACCOUNT roles
    if (input.loungeId && roleType === RoleType.ACCOUNT) {
      await this.validateLoungeExists(input.loungeId);
    }

    // Validate all permission keys exist in the database
    if (input.permissionKeys && input.permissionKeys.length > 0) {
      await this.validatePermissionKeys(input.permissionKeys);
    }

    // Validate role name uniqueness within the appropriate scope
    await this.validateRoleNameUnique(input.name, roleType, input.accountId);

    // Validate user has permission to create this role type
    /*const canCreate = this.canCreateRoleType(
      roleType,
      input.accountId || undefined
    );
    if (!canCreate.canCreate) {
      throw new Error(canCreate.message);
    }*/

    return true;
  }

  /**
   * Validates that an account exists in the database
   *
   * @param accountId - The account ID to validate
   * @returns Promise<Account> - The found account record
   * @throws Error if account is not found
   */
  static async validateAccountExists(accountId: string) {
    const account = await prisma.pDAccount.findUnique({
      where: { id: accountId },
    });

    if (!account) {
      throw new Error("Account not found");
    }

    return account;
  }

  /**
   * Validates that a lounge exists in the database
   *
   * @param loungeId - The lounge ID to validate
   * @returns Promise<Lounge> - The found lounge record
   * @throws Error if lounge is not found
   */
  static async validateLoungeExists(loungeId: string) {
    const lounge = await prisma.lounge.findUnique({
      where: { id: loungeId },
    });

    if (!lounge) {
      throw new Error("Lounge not found");
    }

    return lounge;
  }

  /**
   * Validates that all provided permission keys exist in the database
   *
   * @param permissionKeys - Array of permission keys to validate
   * @returns Promise<Permission[]> - Array of found permission records
   * @throws Error if any permission keys are invalid
   */
  static async validatePermissionKeys(permissionKeys: string[]) {
    if (permissionKeys.length === 0) return [];

    const permissions = await prisma.permission.findMany({
      where: {
        key: { in: permissionKeys },
      },
    });

    // Ensure all requested permission keys were found
    if (permissions.length !== permissionKeys.length) {
      throw new Error("One or more permission keys are invalid");
    }

    return permissions;
  }

  /**
   * Validates that a role name is unique within the appropriate scope
   * ACCOUNT roles must be unique within their account
   * GLOBAL and SYSTEM roles must be globally unique
   *
   * @param name - The role name to validate
   * @param roleType - The type of role (SYSTEM, GLOBAL, ACCOUNT)
   * @param accountId - The account ID for ACCOUNT roles (optional for others)
   * @param excludeId - Role ID to exclude from uniqueness check (for updates)
   * @throws Error if role name already exists in the same scope
   */
  static async validateRoleNameUnique(
    name: string,
    roleType: RoleType,
    accountId?: string | null,
    excludeId?: string
  ) {
    const where: any = { name };

    // Exclude current role when updating
    if (excludeId) {
      where.id = { not: excludeId };
    }

    // Set scope based on role type
    if (roleType === RoleType.ACCOUNT) {
      where.accountId = accountId;
    } else {
      where.accountId = null; // Global/System roles have null accountId
    }

    const existingRole = await prisma.role.findFirst({ where });

    if (existingRole) {
      const scope =
        roleType === RoleType.ACCOUNT ? "this account" : "global scope";
      throw new Error(`Role with this name already exists in ${scope}`);
    }
  }

  /**
   * Checks if the current user/context can create a role of the specified type
   * Implements business rules for role creation permissions
   *
   * @param roleType - The type of role to create
   * @param accountId - The account ID (required for ACCOUNT roles)
   * @returns Object with canCreate boolean and message explaining the result
   */
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
