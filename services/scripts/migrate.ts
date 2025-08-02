import { execSync } from "child_process";

function getMigrationName(): string {
  const nameFlagIndex = process.argv.findIndex((arg) => arg === "--name");
  if (nameFlagIndex === -1 || !process.argv[nameFlagIndex + 1]) {
    console.error("❌ Please provide a migration name using --name");
    process.exit(1);
  }
  return process.argv[nameFlagIndex + 1];
}

function runCommand(command: string) {
  try {
    execSync(command, { stdio: "inherit" });
  } catch (error) {
    console.error(`❌ Command failed: ${command}`);
    process.exit(1);
  }
}

function main() {
  const migrationName = getMigrationName();

  console.log(`🛠 Running prisma:generate...`);
  runCommand("pnpm prisma:generate");

  console.log(`🛠 Running prisma migrate dev --name ${migrationName}...`);
  runCommand(`npx prisma migrate dev --name ${migrationName}`);
}

main();
