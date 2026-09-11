import { Router } from "express";
import { body } from "express-validator";
import { createTeam, getMyTeams, getTeam } from "../controllers/teams.controller";
import { getMatchingStudents } from "../controllers/matching.controller";
import { createInvitation, getTeamInvitations } from "../controllers/invitations.controller";
import { requireStudentAuth } from "../middleware/auth.middleware";
import { runValidation, sanitizeBody } from "../middleware/validate";

const router = Router();

export const teamValidationRules = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Team name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Team name must be between 2 and 100 characters"),

  body("description")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description must be under 500 characters"),

  body("requiredSkills")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 500 })
    .withMessage("Required skills must be under 500 characters"),

  body("maxSize")
    .optional()
    .isInt({ min: 2, max: 50 })
    .withMessage("Max size must be an integer between 2 and 50")
    .toInt()
];

// POST /api/teams
router.post(
  "/",
  requireStudentAuth,
  sanitizeBody(["name", "description", "requiredSkills"]),
  teamValidationRules,
  runValidation,
  createTeam
);

// GET /api/teams/me
router.get("/me", requireStudentAuth, getMyTeams);

// GET /api/teams/:teamId
router.get("/:teamId", requireStudentAuth, getTeam);

// GET /api/teams/:teamId/matching-students
router.get("/:teamId/matching-students", requireStudentAuth, getMatchingStudents);

// POST /api/teams/:teamId/invitations
router.post(
  "/:teamId/invitations",
  requireStudentAuth,
  body("studentId").notEmpty().withMessage("Student ID is required"),
  runValidation,
  createInvitation
);

// GET /api/teams/:teamId/invitations
router.get(
  "/:teamId/invitations",
  requireStudentAuth,
  getTeamInvitations
);

export default router;
