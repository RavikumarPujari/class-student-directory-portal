
import { Router } from "express";
import { getPendingTeams, getAllTeams, reviewTeam } from "../controllers/adminTeams.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

router.use(requireAuth);

router.get("/", getAllTeams);
router.get("/pending", getPendingTeams);
router.post("/:teamId/review", reviewTeam);

export default router;
