import prisma from "../../../config/db";

export class PermissionQueryService {
  // Get permission statistics
  static async getStats() {
    // Get total count
    const total = await prisma.permission.count();

    // Get permissions with role counts
    const permissions = await prisma.permission.findMany({
      include: {
        _count: {
          select: { roles: true },
        },
      },
    });

    // Find most and least used permissions
    let mostUsed = null;
    let leastUsed = null;

    if (permissions.length > 0) {
      const sorted = permissions.sort(
        (a, b) => b._count.roles - a._count.roles
      );

      mostUsed = {
        key: sorted[0].key,
        roleCount: sorted[0]._count.roles,
      };

      leastUsed = {
        key: sorted[sorted.length - 1].key,
        roleCount: sorted[sorted.length - 1]._count.roles,
      };
    }

    return {
      total,
      mostUsedPermission: mostUsed,
      leastUsedPermission: leastUsed,
    };
  }

  // Get permission usage analytics
  static async getUsageAnalytics() {
    const permissions = await prisma.permission.findMany({
      include: {
        _count: {
          select: { roles: true },
        },
      },
    });

    // Calculate usage distribution
    const usageDistribution = {
      unused: 0,
      lowUsage: 0, // 1-2 roles
      mediumUsage: 0, // 3-5 roles
      highUsage: 0, // 6+ roles
    };

    permissions.forEach((permission) => {
      const roleCount = permission._count.roles;
      if (roleCount === 0) {
        usageDistribution.unused++;
      } else if (roleCount <= 2) {
        usageDistribution.lowUsage++;
      } else if (roleCount <= 5) {
        usageDistribution.mediumUsage++;
      } else {
        usageDistribution.highUsage++;
      }
    });

    return {
      totalPermissions: permissions.length,
      usageDistribution,
      averageUsage:
        permissions.length > 0
          ? permissions.reduce((sum, p) => sum + p._count.roles, 0) /
            permissions.length
          : 0,
    };
  }

  // Get permissions by category with counts
  static async getCategoryStats() {
    const permissions = await prisma.permission.findMany({
      include: {
        _count: {
          select: { roles: true },
        },
      },
    });

    // Group by category
    const categoryStats: Record<
      string,
      {
        count: number;
        totalRoleAssignments: number;
        permissions: Array<{ key: string; roleCount: number }>;
      }
    > = {};

    permissions.forEach((permission) => {
      const category = permission.key.split(".")[0];

      if (!categoryStats[category]) {
        categoryStats[category] = {
          count: 0,
          totalRoleAssignments: 0,
          permissions: [],
        };
      }

      categoryStats[category].count++;
      categoryStats[category].totalRoleAssignments += permission._count.roles;
      categoryStats[category].permissions.push({
        key: permission.key,
        roleCount: permission._count.roles,
      });
    });

    return categoryStats;
  }
}
