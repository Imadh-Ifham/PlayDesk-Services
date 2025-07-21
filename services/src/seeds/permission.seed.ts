import { PrismaClient } from "../../generated/prisma";
import { DefaultPermissions } from "../modules/user/models/permission.model";

const prisma = new PrismaClient();

// Permission data with descriptions
const permissionData = [
  // User management permissions
  {
    key: DefaultPermissions.USER_READ,
    description: "View user profiles and basic information",
  },
  {
    key: DefaultPermissions.USER_CREATE,
    description: "Create new user accounts",
  },
  {
    key: DefaultPermissions.USER_UPDATE,
    description: "Edit user profiles and information",
  },
  {
    key: DefaultPermissions.USER_DELETE,
    description: "Delete user accounts",
  },
  {
    key: DefaultPermissions.USER_MANAGE,
    description: "Full user management access (all user operations)",
  },

  // Lounge management permissions
  {
    key: DefaultPermissions.LOUNGE_READ,
    description: "View lounge information and settings",
  },
  {
    key: DefaultPermissions.LOUNGE_UPDATE,
    description: "Edit lounge information and settings",
  },
  {
    key: DefaultPermissions.LOUNGE_MANAGE,
    description: "Full lounge management access (all lounge operations)",
  },

  // Role management permissions
  {
    key: DefaultPermissions.ROLE_READ,
    description: "View roles and their permissions",
  },
  {
    key: DefaultPermissions.ROLE_CREATE,
    description: "Create new roles",
  },
  {
    key: DefaultPermissions.ROLE_UPDATE,
    description: "Edit existing roles and their permissions",
  },
  {
    key: DefaultPermissions.ROLE_DELETE,
    description: "Delete roles (excluding default roles)",
  },
  {
    key: DefaultPermissions.ROLE_MANAGE,
    description: "Full role management access (all role operations)",
  },

  // Permission management permissions
  {
    key: DefaultPermissions.PERMISSION_READ,
    description: "View available permissions",
  },
  {
    key: DefaultPermissions.PERMISSION_CREATE,
    description: "Create new permissions",
  },
  {
    key: DefaultPermissions.PERMISSION_UPDATE,
    description: "Edit existing permissions",
  },
  {
    key: DefaultPermissions.PERMISSION_DELETE,
    description: "Delete permissions (if not assigned to roles)",
  },
  {
    key: DefaultPermissions.PERMISSION_MANAGE,
    description:
      "Full permission management access (all permission operations)",
  },

  // Booking management permissions
  {
    key: DefaultPermissions.BOOKING_READ,
    description: "View booking information and history",
  },
  {
    key: DefaultPermissions.BOOKING_CREATE,
    description: "Create new bookings",
  },
  {
    key: DefaultPermissions.BOOKING_UPDATE,
    description: "Edit existing bookings",
  },
  {
    key: DefaultPermissions.BOOKING_DELETE,
    description: "Cancel or delete bookings",
  },
  {
    key: DefaultPermissions.BOOKING_MANAGE,
    description: "Full booking management access (all booking operations)",
  },

  // Machine management permissions
  {
    key: DefaultPermissions.MACHINE_READ,
    description: "View machine information and availability",
  },
  {
    key: DefaultPermissions.MACHINE_CREATE,
    description: "Add new machines to the system",
  },
  {
    key: DefaultPermissions.MACHINE_UPDATE,
    description: "Edit machine information and settings",
  },
  {
    key: DefaultPermissions.MACHINE_DELETE,
    description: "Remove machines from the system",
  },
  {
    key: DefaultPermissions.MACHINE_MANAGE,
    description: "Full machine management access (all machine operations)",
  },

  // System administration permissions
  {
    key: DefaultPermissions.SYSTEM_ADMIN,
    description: "Full system administration access",
  },
  {
    key: DefaultPermissions.SYSTEM_CONFIG,
    description: "Configure system settings and preferences",
  },
];

// Seed permissions
export async function seedPermissions() {
  console.log("🌱 Seeding permissions...");

  try {
    // Use upsert to avoid duplicates
    for (const permission of permissionData) {
      await prisma.permission.upsert({
        where: { key: permission.key },
        update: {
          description: permission.description,
        },
        create: {
          key: permission.key,
          description: permission.description,
        },
      });
    }

    console.log(`✅ Successfully seeded ${permissionData.length} permissions`);
  } catch (error) {
    console.error("❌ Error seeding permissions:", error);
    throw error;
  }
}

// Main seed function (can be run independently)
async function main() {
  try {
    await seedPermissions();
  } catch (error) {
    console.error("Seeding failed:", error);
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
