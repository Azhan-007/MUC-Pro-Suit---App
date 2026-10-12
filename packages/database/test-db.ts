import { PrismaClient } from '@prisma/client';

async function checkDb() {
  const prisma = new PrismaClient();
  try {
    await prisma.$connect();
    console.log("DB_CONNECTION_SUCCESS");
    await prisma.$disconnect();
  } catch (err) {
    console.error("DB_CONNECTION_FAILED:", err);
    process.exit(1);
  }
}

checkDb();
