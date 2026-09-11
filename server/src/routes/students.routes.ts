 import { Router } from "express";
import {
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  clearAllStudents,
  exportCsv,
  exportExcel,
  getFilterOptions,
  checkEmail,
} from "../controllers/students.controller";
import { studentValidationRules, runValidation, sanitizeBody } from "../middleware/validate";
import { requireAuth } from "../middleware/auth.middleware";
import { writeLimiter } from "../middleware/rateLimiter";

const router = Router();

const sanitizedFields = ["name", "section", "bio", "favoriteDomain", "skills"];

// Public routes
router.get("/meta/filters", getFilterOptions);
router.get("/check-email", checkEmail);
router.get("/", getStudents);
router.get("/:id", getStudentById);

router.post(
  "/",
  writeLimiter,
  sanitizeBody(sanitizedFields),
  studentValidationRules,
  runValidation,
  createStudent
);

// Admin-protected routes
router.put(
  "/:id",
  requireAuth,
  sanitizeBody(sanitizedFields),
  studentValidationRules,
  runValidation,
  updateStudent
);

// MUST be registered before "/:id" so Express doesn't capture "clear-all" as an ID.
router.delete("/clear-all", requireAuth, clearAllStudents);

router.delete("/:id", requireAuth, deleteStudent);

router.get("/export/csv", requireAuth, exportCsv);
router.get("/export/excel", requireAuth, exportExcel);

export default router;
