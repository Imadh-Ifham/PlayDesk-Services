// src/config/db.ts
import { PrismaClient } from "../../generated/prisma";

const prisma = new PrismaClient();

export async function connectDB() {
  try {
    await prisma.$connect();
    console.log("PostgreSQL connected via Prisma");
  } catch (error) {
    console.error("Error connecting to DB", error);
    throw error;
  }
}

export default prisma;
