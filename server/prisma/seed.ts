import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import "dotenv/config";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL || "ravipujari2005@gmail.com";
  const password = process.env.ADMIN_PASSWORD || "@RAVIP";

  const passwordHash = await bcrypt.hash(password, 12);

  // Upsert the default admin: update password if the email already exists,
  // otherwise create it. This avoids duplicates and keeps admin login working.
  const existing = await prisma.admin.findUnique({ where: { email } });
  if (existing) {
    await prisma.admin.update({
      where: { email },
      data: { passwordHash },
    });
    console.log(`✅ Default admin updated: ${email}`);
  } else {
    await prisma.admin.create({
      data: { email, passwordHash, name: "Administrator" },
    });
    console.log(`✅ Default admin created: ${email}`);
  }

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
