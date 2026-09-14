import "dotenv/config";
import app from "./app";
import { prisma } from "./config/prisma";

import { verifyEmailConfiguration } from "./services/email.service";

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 5000;

async function start() {
  try {
    // Verifies the PostgreSQL database & Prisma client are reachable before serving traffic.
    await prisma.$connect();
    console.log("✅ Connected to PostgreSQL database via Prisma");

    await verifyEmailConfiguration();

    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
      console.log(`📚 API base: http://localhost:${PORT}/api`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
}

start();

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});
