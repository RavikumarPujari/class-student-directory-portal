import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { HttpError } from "../middleware/errorHandler";
import { prisma } from "../config/prisma";

export async function getNotifications(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const studentId = req.student?.studentId;
    if (!studentId) throw new HttpError(401, "Authentication required");

    const limit = Number(req.query.limit) || 50;

    const notifications = await prisma.notification.findMany({
      where: { recipientId: studentId },
      orderBy: { createdAt: "desc" },
      take: limit
    });

    res.json({ success: true, data: notifications });
  } catch (err) {
    next(err);
  }
}

export async function getUnreadCount(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const studentId = req.student?.studentId;
    if (!studentId) throw new HttpError(401, "Authentication required");

    const count = await prisma.notification.count({
      where: { recipientId: studentId, isRead: false }
    });

    res.json({ success: true, data: { unreadCount: count } });
  } catch (err) {
    next(err);
  }
}

export async function markAsRead(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const studentId = req.student?.studentId;
    if (!studentId) throw new HttpError(401, "Authentication required");
    
    const { id } = req.params;

    const notification = await prisma.notification.findUnique({
      where: { id }
    });

    if (!notification) throw new HttpError(404, "Notification not found");
    if (notification.recipientId !== studentId) throw new HttpError(403, "Not authorized to modify this notification");

    const updated = await prisma.notification.update({
      where: { id },
      data: { isRead: true }
    });

    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
}

export async function markAllAsRead(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const studentId = req.student?.studentId;
    if (!studentId) throw new HttpError(401, "Authentication required");

    await prisma.notification.updateMany({
      where: { recipientId: studentId, isRead: false },
      data: { isRead: true }
    });

    res.json({ success: true, message: "All notifications marked as read" });
  } catch (err) {
    next(err);
  }
}
