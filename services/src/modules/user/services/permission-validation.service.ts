import prisma from "../../../config/db";
import {
  CreatePermissionInput,
  UpdatePermissionInput,
  PermissionValidation,
  isValidPermissionKeyFormat,
  isPermissionCategoryValid,
  isPermissionActionValid,
  PermissionCategories,
  PermissionActions,
  createPermissionKey,
} from "../models/permission.model";

export class PermissionValidationService {
  // Validate create permission input
  static async validateCreateInput(input: CreatePermissionInput) {
    const { category, action, name, description } = input;

    // Check required fields
    if (!category || !action || !name || !description) {
      throw new Error("Category, action, name, and description are required");
    }

    // Validate category
    if (!isPermissionCategoryValid(category)) {
      throw new Error(
        `Invalid permission category. It should be one of: ${Object.values(
          PermissionCategories
        ).join(", ")}`
      );
    }

    // Validate action
    if (!isPermissionActionValid(action)) {
      throw new Error(
        `Invalid permission action. It should be one of: ${Object.values(
          PermissionActions
        ).join(", ")}`
      );
    }

    const key = createPermissionKey(category, action);

    // Validate key length
    if (
      key.length < PermissionValidation.KEY_MIN_LENGTH ||
      key.length > PermissionValidation.KEY_MAX_LENGTH
    ) {
      throw new Error(
        `Key must be between ${PermissionValidation.KEY_MIN_LENGTH} and ${PermissionValidation.KEY_MAX_LENGTH} characters`
      );
    }

    // Validate name length
    if (
      name.length < PermissionValidation.NAME_MIN_LENGTH ||
      name.length > PermissionValidation.NAME_MAX_LENGTH
    ) {
      throw new Error(
        `Name must be between ${PermissionValidation.NAME_MIN_LENGTH} and ${PermissionValidation.NAME_MAX_LENGTH} characters`
      );
    }

    // Validate description length
    if (
      description.length < PermissionValidation.DESCRIPTION_MIN_LENGTH ||
      description.length > PermissionValidation.DESCRIPTION_MAX_LENGTH
    ) {
      throw new Error(
        `Description must be between ${PermissionValidation.DESCRIPTION_MIN_LENGTH} and ${PermissionValidation.DESCRIPTION_MAX_LENGTH} characters`
      );
    }

    // Validate key format
    if (!isValidPermissionKeyFormat(key)) {
      throw new Error(
        "Invalid permission key format. Use lowercase letters, numbers, and dots (e.g., user.create)"
      );
    }
  }

  // Validate update permission input
  static async validateUpdateInput(input: UpdatePermissionInput) {
    const { name, description } = input;

    // Validate name if provided
    if (name) {
      if (
        name.length < PermissionValidation.NAME_MIN_LENGTH ||
        name.length > PermissionValidation.NAME_MAX_LENGTH
      ) {
        throw new Error(
          `Name must be between ${PermissionValidation.NAME_MIN_LENGTH} and ${PermissionValidation.NAME_MAX_LENGTH} characters`
        );
      }
    }

    // Validate description if provided
    if (description) {
      if (
        description.length < PermissionValidation.DESCRIPTION_MIN_LENGTH ||
        description.length > PermissionValidation.DESCRIPTION_MAX_LENGTH
      ) {
        throw new Error(
          `Description must be between ${PermissionValidation.DESCRIPTION_MIN_LENGTH} and ${PermissionValidation.DESCRIPTION_MAX_LENGTH} characters`
        );
      }
    }
  }

  // Check if permission key is unique
  static async validateKeyUnique(category: string, action: string) {
    const key = createPermissionKey(category, action);

    const existingPermission = await prisma.permission.findUnique({
      where: { key },
    });

    if (existingPermission) {
      throw new Error("Permission with this key already exists");
    }
  }

  // Create permission key helper
  static createKey(category: string, action: string) {
    return createPermissionKey(category, action);
  }
}
