const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.$executeRawUnsafe('TRUNCATE TABLE "teams" CASCADE;')
  .then(() => console.log('Cleaned'))
  .catch(console.error)
  .finally(() => prisma.$disconnect());

