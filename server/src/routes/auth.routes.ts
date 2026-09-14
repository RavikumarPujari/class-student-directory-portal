import { Router } from "express";
import { login, me, adminLogout } from "../controllers/auth.controller";
import { loginValidationRules, runValidation, sanitizeBody } from "../middleware/validate";
import { loginLimiter } from "../middleware/rateLimiter";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

router.post(
  "/login",
  loginLimiter,
  sanitizeBody(["email"]),
  loginValidationRules,
  runValidation,
  login
);

router.post("/logout", requireAuth, adminLogout);
router.get("/me", requireAuth, me);

export default router;
