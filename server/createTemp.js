const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createTempStudent() {
  const passwordHash = await bcrypt.hash('password123', 12);
  
  await prisma.student.upsert({
    where: { email: 'test@student.com' },
    update: {},
    create: {
      name: 'Test Student',
      usn: 'TEST001',
      section: 'A',
      branch: 'CSE',
      year: '1st',
      semester: 1,
      phone: '9876543210',
      email: 'test@student.com',
      favoriteDomain: 'Web Development',
      skills: 'React, Node.js',
      passwordHash: passwordHash
    }
  });
  
  console.log('Temporary student account created!');
  await prisma.$disconnect();
}

createTempStudent().catch(console.error);

