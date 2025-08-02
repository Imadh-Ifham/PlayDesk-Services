import bcrypt from "bcryptjs";
import prisma from "../../../config/db";
import {
  CreateUserInput,
  UpdateUserInput,
  UserFilters,
  UserPaginationOptions,
  UserWithRelations,
  UserStats,
  ChangePasswordInput,
  LoginInput,
  UserValidation,
  isActiveUser,
  canUserLogin,
} from "../models/user.model";
import { UserStatus } from "../../../../generated/prisma";

export class UserService {
  // Hash password using bcrypt
  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  // Compare password with hash
  static async comparePassword(
    password: string,
    hashedPassword: string
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  // Validate user input
  static validateUser(input: CreateUserInput | UpdateUserInput): string[] {
    const errors: string[] = [];

    if ("username" in input && input.username) {
      if (input.username.length < UserValidation.USERNAME_MIN_LENGTH) {
        errors.push(
          `Username must be at least ${UserValidation.USERNAME_MIN_LENGTH} characters`
        );
      }
      if (input.username.length > UserValidation.USERNAME_MAX_LENGTH) {
        errors.push(
          `Username must be no more than ${UserValidation.USERNAME_MAX_LENGTH} characters`
        );
      }
      if (!/^[a-zA-Z0-9_.-]+$/.test(input.username)) {
        errors.push(
          "Username can only contain letters, numbers, dots, dashes, and underscores"
        );
      }
    }

    if ("password" in input && input.password) {
      if (input.password.length < UserValidation.PASSWORD_MIN_LENGTH) {
        errors.push(
          `Password must be at least ${UserValidation.PASSWORD_MIN_LENGTH} characters`
        );
      }
    }

    if ("email" in input && input.email) {
      if (!UserValidation.EMAIL_REGEX.test(input.email)) {
        errors.push("Invalid email format");
      }
    }

    return errors;
  }

  // Get users with filtering and pagination
  static async getUsers(
    filters: UserFilters,
    pagination: UserPaginationOptions
  ): Promise<{ users: UserWithRelations[]; total: number }> {
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = pagination;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.pdAccountId) {
      where.pdAccountId = filters.pdAccountId;
    }

    if (filters.roleId) {
      where.roleId = filters.roleId;
    }

    if (filters.search) {
      where.OR = [
        { username: { contains: filters.search, mode: "insensitive" } },
        { email: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    // Execute queries in parallel
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          pdAccount: {
            select: {
              id: true,
              name: true,
            },
          },
          role: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return { users: users as UserWithRelations[], total };
  }

  // Get user by ID with relations
  static async getUserById(id: string): Promise<UserWithRelations | null> {
    return prisma.user.findUnique({
      where: { id },
      include: {
        pdAccount: {
          select: {
            id: true,
            name: true,
          },
        },
        role: {
          select: {
            id: true,
            name: true,
            permissions: {
              include: {
                permission: true,
                lounge: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    }) as Promise<UserWithRelations | null>;
  }

  // Get user by username and account
  static async getUserByUsername(
    username: string,
    pdAccountId: string
  ): Promise<UserWithRelations | null> {
    return prisma.user.findUnique({
      where: {
        username_pdAccountId: {
          username,
          pdAccountId,
        },
      },
      include: {
        pdAccount: {
          select: {
            id: true,
            name: true,
          },
        },
        role: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    }) as Promise<UserWithRelations | null>;
  }

  // Create new user
  static async createUser(input: CreateUserInput): Promise<UserWithRelations> {
    // Validate input
    const validationErrors = this.validateUser(input);
    if (validationErrors.length > 0) {
      throw new Error(`Validation failed: ${validationErrors.join(", ")}`);
    }

    // Check if username already exists in this account
    const existingUser = await prisma.user.findUnique({
      where: {
        username_pdAccountId: {
          username: input.username,
          pdAccountId: input.pdAccountId,
        },
      },
    });

    if (existingUser) {
      throw new Error("Username already exists in this account");
    }

    // Check if email already exists (globally unique)
    if (input.email) {
      const existingEmail = await prisma.user.findUnique({
        where: { email: input.email },
      });

      if (existingEmail) {
        throw new Error("Email already exists");
      }
    }

    // Verify that account and role exist
    const [account, role] = await Promise.all([
      prisma.pDAccount.findUnique({ where: { id: input.pdAccountId } }),
      prisma.role.findUnique({ where: { id: input.roleId } }),
    ]);

    if (!account) {
      throw new Error("Account not found");
    }

    if (!role) {
      throw new Error("Role not found");
    }

    // Verify role belongs to the same account
    if (role.accountId !== input.pdAccountId) {
      throw new Error("Role does not belong to the specified account");
    }

    // Hash password
    const hashedPassword = await this.hashPassword(input.password);

    // Create user
    const user = await prisma.user.create({
      data: {
        username: input.username,
        password: hashedPassword,
        email: input.email,
        pdAccountId: input.pdAccountId,
        roleId: input.roleId,
        status: input.status || UserStatus.ACTIVE,
      },
      include: {
        pdAccount: {
          select: {
            id: true,
            name: true,
          },
        },
        role: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return user as UserWithRelations;
  }

  // Update user
  static async updateUser(
    id: string,
    input: UpdateUserInput
  ): Promise<UserWithRelations> {
    // Validate input
    const validationErrors = this.validateUser(input);
    if (validationErrors.length > 0) {
      throw new Error(`Validation failed: ${validationErrors.join(", ")}`);
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      throw new Error("User not found");
    }

    // Check username uniqueness if username is being updated
    if (input.username && input.username !== existingUser.username) {
      const usernameExists = await prisma.user.findUnique({
        where: {
          username_pdAccountId: {
            username: input.username,
            pdAccountId: existingUser.pdAccountId,
          },
        },
      });

      if (usernameExists) {
        throw new Error("Username already exists in this account");
      }
    }

    // Check email uniqueness if email is being updated
    if (input.email && input.email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email: input.email },
      });

      if (emailExists) {
        throw new Error("Email already exists");
      }
    }

    // Verify role exists and belongs to same account if role is being updated
    if (input.roleId && input.roleId !== existingUser.roleId) {
      const role = await prisma.role.findUnique({
        where: { id: input.roleId },
      });

      if (!role) {
        throw new Error("Role not found");
      }

      if (role.accountId !== existingUser.pdAccountId) {
        throw new Error("Role does not belong to the user's account");
      }
    }

    // Prepare update data
    const updateData: any = { ...input };

    // Hash password if it's being updated
    if (input.password) {
      updateData.password = await this.hashPassword(input.password);
    }

    // Update user
    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      include: {
        pdAccount: {
          select: {
            id: true,
            name: true,
          },
        },
        role: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return user as UserWithRelations;
  }

  // Delete user (soft delete by changing status)
  static async deleteUser(id: string): Promise<void> {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new Error("User not found");
    }

    await prisma.user.update({
      where: { id },
      data: { status: UserStatus.DELETED },
    });
  }

  // Authenticate user
  static async authenticateUser(
    input: LoginInput
  ): Promise<UserWithRelations | null> {
    const user = await prisma.user.findUnique({
      where: {
        username_pdAccountId: {
          username: input.username,
          pdAccountId: input.pdAccountId,
        },
      },
      include: {
        pdAccount: {
          select: {
            id: true,
            name: true,
          },
        },
        role: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!user) {
      return null;
    }

    if (!canUserLogin(user)) {
      throw new Error("User account is not active");
    }

    const isPasswordValid = await this.comparePassword(
      input.password,
      user.password
    );
    if (!isPasswordValid) {
      return null;
    }

    return user as UserWithRelations;
  }

  // Change password
  static async changePassword(
    userId: string,
    input: ChangePasswordInput
  ): Promise<void> {
    if (input.newPassword !== input.confirmPassword) {
      throw new Error("New password and confirmation do not match");
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new Error("User not found");
    }

    const isCurrentPasswordValid = await this.comparePassword(
      input.currentPassword,
      user.password
    );
    if (!isCurrentPasswordValid) {
      throw new Error("Current password is incorrect");
    }

    if (input.newPassword.length < UserValidation.PASSWORD_MIN_LENGTH) {
      throw new Error(
        `Password must be at least ${UserValidation.PASSWORD_MIN_LENGTH} characters`
      );
    }

    const hashedPassword = await this.hashPassword(input.newPassword);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
  }

  // Get user statistics
  static async getUserStats(pdAccountId?: string): Promise<UserStats> {
    const where = pdAccountId ? { pdAccountId } : {};

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [total, active, suspended, deleted, recentlyJoined] =
      await Promise.all([
        prisma.user.count({ where }),
        prisma.user.count({ where: { ...where, status: UserStatus.ACTIVE } }),
        prisma.user.count({
          where: { ...where, status: UserStatus.SUSPENDED },
        }),
        prisma.user.count({ where: { ...where, status: UserStatus.DELETED } }),
        prisma.user.count({
          where: {
            ...where,
            createdAt: { gte: thirtyDaysAgo },
            status: { not: UserStatus.DELETED },
          },
        }),
      ]);

    return {
      total,
      active,
      suspended,
      deleted,
      recentlyJoined,
    };
  }
}
