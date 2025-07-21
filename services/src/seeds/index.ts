import { seedPermissions } from "./permission.seed";
import { PrismaClient } from "../../generated/prisma";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  try {
    // Run permission seeding
    await seedPermissions();

    console.log("✅ Database seeding completed successfully!");
  } catch (error) {
    console.error("❌ Database seeding failed:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if this file is executed directly
if (require.main === module) {
  main().catch((error) => {
    console.error("Seeding process failed:", error);
    process.exit(1);
  });
}

export default main;
