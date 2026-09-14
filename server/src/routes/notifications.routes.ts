import { Router } from "express";
import { getNotifications, getUnreadCount, markAsRead, markAllAsRead } from "../controllers/notifications.controller";
import { requireStudentAuth } from "../middleware/auth.middleware";

const router = Router();

router.use(requireStudentAuth);

router.get("/", getNotifications);
router.get("/unread-count", getUnreadCount);
router.patch("/read-all", markAllAsRead);
router.patch("/:id/read", markAsRead);

export default router;
