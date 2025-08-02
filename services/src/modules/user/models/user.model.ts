import {
  User,
  UserStatus,
  PDAccount,
  Role,
} from "../../../../generated/prisma";

// Re-export the Prisma-generated User type
export type UserModel = User;

// User status enum (matches Prisma enum)
export { UserStatus };

// User with relations
export interface UserWithRelations extends User {
  pdAccount: {
    id: string;
    name: string;
  };
  role: {
    id: string;
    name: string;
  };
}

// Create user input (for registration/creation)
export interface CreateUserInput {
  username: string;
  password: string;
  email?: string;
  pdAccountId: string;
  roleId: string;
  status?: UserStatus;
}

// Update user input (for profile updates)
export interface UpdateUserInput {
  username?: string;
  password?: string;
  email?: string;
  roleId?: string;
  status?: UserStatus;
}

// User response (excludes sensitive data like password)
export interface UserResponse {
  id: string;
  username: string;
  email?: string;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
  pdAccountId: string;
  roleId: string;
  pdAccount?: {
    id: string;
    name: string;
  };
  role?: {
    id: string;
    name: string;
  };
}

// Login input
export interface LoginInput {
  username: string;
  password: string;
  pdAccountId: string; // Required for username uniqueness per account
}

// User query filters
export interface UserFilters {
  status?: UserStatus;
  pdAccountId?: string;
  roleId?: string;
  search?: string; // For username/email search
}

// User pagination options
export interface UserPaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: "username" | "email" | "createdAt" | "updatedAt";
  sortOrder?: "asc" | "desc";
}

// Password change input
export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// User statistics (for admin dashboard)
export interface UserStats {
  total: number;
  active: number;
  suspended: number;
  deleted: number;
  recentlyJoined: number; // Last 30 days
}

// User validation rules
export const UserValidation = {
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 50,
  PASSWORD_MIN_LENGTH: 8,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
} as const;

// Helper function to transform User to UserResponse
export function userToResponse(user: UserWithRelations): UserResponse {
  return {
    id: user.id,
    username: user.username,
    email: user.email ?? undefined,
    status: user.status,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    pdAccountId: user.pdAccountId,
    roleId: user.roleId,
    pdAccount: {
      id: user.pdAccount.id,
      name: user.pdAccount.name,
    },
    role: {
      id: user.role.id,
      name: user.role.name,
    },
  };
}

// Helper function to transform multiple users
export function usersToResponse(users: UserWithRelations[]): UserResponse[] {
  return users.map(userToResponse);
}

// Type guard to check if user is active
export function isActiveUser(user: User): boolean {
  return user.status === UserStatus.ACTIVE;
}

// Type guard to check if user can login
export function canUserLogin(user: User): boolean {
  return user.status === UserStatus.ACTIVE;
}
