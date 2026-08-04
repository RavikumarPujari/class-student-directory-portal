import "dotenv/config";
import app from "./app";
import { prisma } from "./config/prisma";

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 5000;

async function start() {
  try {
    // Verifies the SQLite database file & Prisma client are reachable before serving traffic.
    await prisma.$connect();
    console.log("✅ Connected to SQLite database via Prisma");

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
