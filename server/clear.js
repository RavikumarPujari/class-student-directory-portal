const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function clear() {
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE "students" CASCADE;`);
  console.log('Database truncated successfully.');
  await prisma.$disconnect();
}

clear().catch(console.error);

