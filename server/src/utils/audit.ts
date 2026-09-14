import { prisma } from "../config/prisma";

export async function logAccess(req: any, action: string, targetId: string | null = null, reason: string | null = null) {
  const adminId = req.admin?.adminId || req.admin?.id;
  // Fallbacks for actor details
  const actorRole = req.admin?.role || (adminId ? "admin" : null) || req.student?.role || "unknown";
  const actorId = adminId || req.student?.studentId || "anonymous";

  try {
    await prisma.accessLog.create({
      data: {
        actorId,
        actorRole,
        targetId,
        action,
        reason
      }
    });
  } catch (error) {
    console.error("Failed to log access", error);
  }
}
