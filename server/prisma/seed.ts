import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import "dotenv/config";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL || "admin@classportal.com";
  const password = process.env.ADMIN_PASSWORD || "Admin@12345";

  const existing = await prisma.admin.findUnique({ where: { email } });
  if (existing) {
    console.log(`Admin already exists: ${email}`);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.admin.create({
    data: { email, passwordHash, name: "Administrator" },
  });

  console.log("✅ Default admin created:");
  console.log(`   Email:    ${email}`);
  console.log(`   Password: ${password}`);
  console.log("   ⚠️  Change this password after first login in production.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
