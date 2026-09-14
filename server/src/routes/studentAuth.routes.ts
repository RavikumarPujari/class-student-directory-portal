import { Router } from "express";
import { loginStudent, getMe, updateMe, deleteMe, studentLogout } from "../controllers/studentAuth.controller";
import { requireStudentAuth } from "../middleware/auth.middleware";
import { studentLoginValidationRules, runValidation } from "../middleware/validate";
import { studentLoginLimiter } from "../middleware/rateLimiter";

const router = Router();

router.post("/login", studentLoginLimiter, studentLoginValidationRules, runValidation, loginStudent);

router.post("/logout", requireStudentAuth, studentLogout);

router.get("/me", requireStudentAuth, getMe);

router.put("/me", requireStudentAuth, updateMe);

router.delete("/me", requireStudentAuth, deleteMe);

export default router;
