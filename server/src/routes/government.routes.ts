import { Router } from "express";
import { getGovernmentStats } from "../controllers/government.controller";
import { requireGovernmentAuth } from "../middleware/auth.middleware";

const router = Router();

router.get("/dashboard", requireGovernmentAuth, getGovernmentStats);

export default router;
