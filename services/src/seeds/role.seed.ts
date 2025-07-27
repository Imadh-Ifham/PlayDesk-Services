import { PrismaClient } from "../../generated/prisma";
import { DefaultPermissions } from "../modules/user/models/permission.model";
import { DefaultRoleTypes } from "../modules/user/models/role.model";

const prisma = new PrismaClient();

// Default role configurations with their permissions
const defaultRolesConfig = [
  {
    name: DefaultRoleTypes.ADMIN,
    isDefault: true,
    description: "System administrator with full access",
    permissions: [
      // Full system access
      DefaultPermissions.SYSTEM_ADMIN,
      DefaultPermissions.SYSTEM_CONFIG,

      // Full user management
      DefaultPermissions.USER_MANAGE,
      DefaultPermissions.USER_READ,
      DefaultPermissions.USER_CREATE,
      DefaultPermissions.USER_UPDATE,
      DefaultPermissions.USER_DELETE,

      // Full role management
      DefaultPermissions.ROLE_MANAGE,
      DefaultPermissions.ROLE_READ,
      DefaultPermissions.ROLE_CREATE,
      DefaultPermissions.ROLE_UPDATE,
      DefaultPermissions.ROLE_DELETE,

      // Full permission management
      DefaultPermissions.PERMISSION_MANAGE,
      DefaultPermissions.PERMISSION_READ,
      DefaultPermissions.PERMISSION_CREATE,
      DefaultPermissions.PERMISSION_UPDATE,
      DefaultPermissions.PERMISSION_DELETE,

      // Full lounge management
      DefaultPermissions.LOUNGE_MANAGE,
      DefaultPermissions.LOUNGE_READ,
      DefaultPermissions.LOUNGE_UPDATE,

      // Full booking management
      DefaultPermissions.BOOKING_MANAGE,
      DefaultPermissions.BOOKING_READ,
      DefaultPermissions.BOOKING_CREATE,
      DefaultPermissions.BOOKING_UPDATE,
      DefaultPermissions.BOOKING_DELETE,

      // Full machine management
      DefaultPermissions.MACHINE_MANAGE,
      DefaultPermissions.MACHINE_READ,
      DefaultPermissions.MACHINE_CREATE,
      DefaultPermissions.MACHINE_UPDATE,
      DefaultPermissions.MACHINE_DELETE,
    ],
  },
  {
    name: DefaultRoleTypes.MANAGER,
    isDefault: true,
    description: "Lounge manager with operational control",
    permissions: [
      // User management (excluding delete)
      DefaultPermissions.USER_READ,
      DefaultPermissions.USER_CREATE,
      DefaultPermissions.USER_UPDATE,

      // Role management (read only)
      DefaultPermissions.ROLE_READ,

      // Permission read access
      DefaultPermissions.PERMISSION_READ,

      // Lounge management
      DefaultPermissions.LOUNGE_READ,
      DefaultPermissions.LOUNGE_UPDATE,

      // Full booking management
      DefaultPermissions.BOOKING_MANAGE,
      DefaultPermissions.BOOKING_READ,
      DefaultPermissions.BOOKING_CREATE,
      DefaultPermissions.BOOKING_UPDATE,
      DefaultPermissions.BOOKING_DELETE,

      // Machine management (excluding delete)
      DefaultPermissions.MACHINE_READ,
      DefaultPermissions.MACHINE_CREATE,
      DefaultPermissions.MACHINE_UPDATE,
    ],
  },
  {
    name: DefaultRoleTypes.EMPLOYEE,
    isDefault: true,
    description: "Staff member with operational access",
    permissions: [
      // Limited user management
      DefaultPermissions.USER_READ,

      // Role read access
      DefaultPermissions.ROLE_READ,

      // Permission read access
      DefaultPermissions.PERMISSION_READ,

      // Lounge read access
      DefaultPermissions.LOUNGE_READ,

      // Basic booking management
      DefaultPermissions.BOOKING_READ,
      DefaultPermissions.BOOKING_CREATE,
      DefaultPermissions.BOOKING_UPDATE,

      // Machine read and basic operations
      DefaultPermissions.MACHINE_READ,
      DefaultPermissions.MACHINE_UPDATE,
    ],
  },
  {
    name: DefaultRoleTypes.CUSTOMER,
    isDefault: true,
    description: "Regular customer with booking access",
    permissions: [
      // Own profile management
      DefaultPermissions.USER_READ,

      // Lounge information
      DefaultPermissions.LOUNGE_READ,

      // Booking management (own bookings)
      DefaultPermissions.BOOKING_READ,
      DefaultPermissions.BOOKING_CREATE,
      DefaultPermissions.BOOKING_UPDATE,
      DefaultPermissions.BOOKING_DELETE,

      // Machine availability
      DefaultPermissions.MACHINE_READ,
    ],
  },
  {
    name: DefaultRoleTypes.GUEST,
    isDefault: true,
    description: "Guest user with limited access",
    permissions: [
      // Basic information access
      DefaultPermissions.LOUNGE_READ,
      DefaultPermissions.MACHINE_READ,

      // View-only booking access
      DefaultPermissions.BOOKING_READ,
    ],
  },
];

// Create roles for a specific lounge
export async function createDefaultRolesForLounge(loungeId: string) {
  console.log(`🌱 Creating default roles for lounge: ${loungeId}...`);

  try {
    // First, get all permissions to create a lookup map
    const permissions = await prisma.permission.findMany({
      select: { id: true, key: true },
    });

    const permissionKeyToId = permissions.reduce((acc, perm) => {
      acc[perm.key] = perm.id;
      return acc;
    }, {} as Record<string, string>);

    // Create each default role
    for (const roleConfig of defaultRolesConfig) {
      try {
        // Check if role already exists
        const existingRole = await prisma.role.findFirst({
          where: {
            name: roleConfig.name,
            loungeId: loungeId,
          },
        });

        if (existingRole) {
          console.log(
            `⚠️  Role '${roleConfig.name}' already exists for lounge ${loungeId}, skipping...`
          );
          continue;
        }

        // Create the role
        const role = await prisma.role.create({
          data: {
            name: roleConfig.name,
            isDefault: roleConfig.isDefault,
            loungeId: loungeId,
          },
        });

        // Assign permissions to the role
        const validPermissionIds = roleConfig.permissions
          .map((permKey) => permissionKeyToId[permKey])
          .filter((id) => id !== undefined);

        if (validPermissionIds.length > 0) {
          await prisma.rolePermission.createMany({
            data: validPermissionIds.map((permissionId) => ({
              roleId: role.id,
              permissionId: permissionId,
            })),
          });
        }

        console.log(
          `✅ Created role '${roleConfig.name}' with ${validPermissionIds.length} permissions`
        );
      } catch (roleError) {
        console.error(
          `❌ Error creating role '${roleConfig.name}':`,
          roleError
        );
      }
    }

    console.log(`✅ Successfully created default roles for lounge ${loungeId}`);
  } catch (error) {
    console.error(
      `❌ Error creating default roles for lounge ${loungeId}:`,
      error
    );
    throw error;
  }
}

// Seed roles for all existing lounges
export async function seedDefaultRoles() {
  console.log("🌱 Seeding default roles for all lounges...");

  try {
    // Get all existing lounges
    const lounges = await prisma.lounge.findMany({
      select: { id: true, name: true },
    });

    if (lounges.length === 0) {
      console.log(
        "⚠️  No lounges found. Please create lounges first before seeding roles."
      );
      return;
    }

    console.log(
      `Found ${lounges.length} lounge(s). Creating default roles for each...`
    );

    // Create default roles for each lounge
    for (const lounge of lounges) {
      await createDefaultRolesForLounge(lounge.id);
    }

    console.log(
      `✅ Successfully seeded default roles for ${lounges.length} lounge(s)`
    );
  } catch (error) {
    console.error("❌ Error seeding default roles:", error);
    throw error;
  }
}

// Create a sample lounge and roles (for testing)
export async function createSampleLoungeWithRoles() {
  console.log("🌱 Creating sample lounge with default roles...");

  try {
    // Create a sample lounge
    const sampleLounge = await prisma.lounge.upsert({
      where: { id: "SAMPLE01" },
      update: {
        name: "Sample Gaming Lounge",
        ownerEmail: "owner@samplelounge.com",
      },
      create: {
        id: "SAMPLE01",
        name: "Sample Gaming Lounge",
        ownerEmail: "owner@samplelounge.com",
      },
    });

    console.log(`✅ Created/updated sample lounge: ${sampleLounge.name}`);

    // Create default roles for the sample lounge
    await createDefaultRolesForLounge(sampleLounge.id);

    console.log("✅ Sample lounge with default roles created successfully");
  } catch (error) {
    console.error("❌ Error creating sample lounge with roles:", error);
    throw error;
  }
}

// Get role summary for a lounge
export async function getRoleSummary(loungeId?: string) {
  try {
    const where = loungeId ? { loungeId } : {};

    const roles = await prisma.role.findMany({
      where,
      include: {
        _count: {
          select: {
            permissions: true,
            users: true,
          },
        },
        lounge: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [{ loungeId: "asc" }, { isDefault: "desc" }, { name: "asc" }],
    });

    console.log("\n📊 Role Summary:");
    console.log("================");

    let currentLoungeId = "";
    for (const role of roles) {
      if (role.loungeId !== currentLoungeId) {
        currentLoungeId = role.loungeId;
        console.log(`\n🏢 Lounge: ${role.lounge.name} (${role.loungeId})`);
        console.log("───────────────────────────────────────");
      }

      const defaultFlag = role.isDefault ? "🔧 (default)" : "👤 (custom)";
      console.log(`  ${defaultFlag} ${role.name}`);
      console.log(`    Permissions: ${role._count.permissions}`);
      console.log(`    Users: ${role._count.users}`);
    }

    console.log(`\n✅ Total roles: ${roles.length}`);
  } catch (error) {
    console.error("❌ Error getting role summary:", error);
  }
}

// Main seed function
async function main() {
  try {
    console.log("🚀 Starting role seeding process...\n");

    // Option 1: Seed roles for existing lounges
    await seedDefaultRoles();

    // Option 2: Create a sample lounge with roles (uncomment if needed)
    // await createSampleLoungeWithRoles();

    // Show summary
    await getRoleSummary();
  } catch (error) {
    console.error("❌ Role seeding failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if this file is executed directly
if (require.main === module) {
  main();
}

export default main;
