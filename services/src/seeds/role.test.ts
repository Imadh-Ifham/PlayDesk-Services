#!/usr/bin/env node

/**
 * Role Seeding Test Script
 *
 * This script demonstrates different ways to seed roles:
 * 1. Create sample lounge with roles
 * 2. Seed roles for existing lounges
 * 3. Show role summary
 */

import { PrismaClient } from "../../generated/prisma";
import {
  createSampleLoungeWithRoles,
  seedDefaultRoles,
  getRoleSummary,
  createDefaultRolesForLounge,
} from "./role.seed";

const prisma = new PrismaClient();

async function testRoleSeeding() {
  console.log("🧪 Testing Role Seeding Functions\n");

  try {
    // 1. Create a sample lounge with roles (for demo purposes)
    console.log("1️⃣  Creating sample lounge with default roles...");
    await createSampleLoungeWithRoles();
    console.log("   ✅ Sample lounge created\n");

    // 2. Show initial summary
    console.log("2️⃣  Initial role summary:");
    await getRoleSummary();
    console.log("");

    // 3. Seed roles for any other existing lounges
    console.log("3️⃣  Seeding roles for all existing lounges...");
    await seedDefaultRoles();
    console.log("   ✅ All lounges processed\n");

    // 4. Show final summary
    console.log("4️⃣  Final role summary:");
    await getRoleSummary();

    console.log("\n🎉 Role seeding test completed successfully!");
  } catch (error) {
    console.error("❌ Role seeding test failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Individual test functions
async function testCreateSpecificLoungeRoles() {
  console.log("🧪 Testing specific lounge role creation...");

  try {
    // Replace 'YOUR_LOUNGE_ID' with an actual lounge ID
    const loungeId = "SAMPLE01";
    await createDefaultRolesForLounge(loungeId);

    console.log(`✅ Roles created for lounge: ${loungeId}`);
    await getRoleSummary(loungeId);
  } catch (error) {
    console.error("❌ Specific lounge role test failed:", error);
  }
}

async function showExistingLounges() {
  console.log("🏢 Existing lounges:");
  console.log("==================");

  try {
    const lounges = await prisma.lounge.findMany({
      select: {
        id: true,
        name: true,
        ownerEmail: true,
        _count: {
          select: {
            roles: true,
            users: true,
          },
        },
      },
    });

    if (lounges.length === 0) {
      console.log("No lounges found. Create a lounge first!");
      return;
    }

    lounges.forEach((lounge, index) => {
      console.log(`${index + 1}. ${lounge.name} (${lounge.id})`);
      console.log(`   Owner: ${lounge.ownerEmail}`);
      console.log(
        `   Roles: ${lounge._count.roles}, Users: ${lounge._count.users}`
      );
    });
  } catch (error) {
    console.error("❌ Error fetching lounges:", error);
  }
}

// Main function with menu
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case "test":
      await testRoleSeeding();
      break;

    case "specific":
      await testCreateSpecificLoungeRoles();
      break;

    case "lounges":
      await showExistingLounges();
      break;

    case "summary":
      await getRoleSummary();
      break;

    case "sample":
      await createSampleLoungeWithRoles();
      await getRoleSummary("SAMPLE01");
      break;

    default:
      console.log("🚀 Role Seeding Test Commands:");
      console.log("===============================");
      console.log("npm run seed:roles test      - Run full role seeding test");
      console.log(
        "npm run seed:roles specific  - Create roles for specific lounge"
      );
      console.log("npm run seed:roles lounges   - Show existing lounges");
      console.log("npm run seed:roles summary   - Show role summary");
      console.log("npm run seed:roles sample    - Create sample lounge only");
      console.log("");
      console.log("Examples:");
      console.log("node dist/seeds/role.test.js test");
      console.log("node dist/seeds/role.test.js summary");
      break;
  }
}

// Run the script
if (require.main === module) {
  main().catch((error) => {
    console.error("Script failed:", error);
    process.exit(1);
  });
}

export { testRoleSeeding, showExistingLounges };
