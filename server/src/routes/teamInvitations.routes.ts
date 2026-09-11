import { Router } from "express";
import { requireStudentAuth } from "../middleware/auth.middleware";
import { getMyInvitations, acceptInvitation, declineInvitation } from "../controllers/studentInvitations.controller";

const router = Router();

// GET /api/team-invitations/me
router.get("/me", requireStudentAuth, getMyInvitations);

// POST /api/team-invitations/:token/accept
router.post("/:token/accept", requireStudentAuth, acceptInvitation);

// POST /api/team-invitations/:token/decline
router.post("/:token/decline", requireStudentAuth, declineInvitation);

export default router;

