import { Router } from "express";
import { body } from "express-validator";
import { 
  createTeam, 
  getMyTeams, 
  getTeam, 
  getTeamMessages, 
  createTeamMessage,
  clearTeamMessages,
  deleteTeamMessage, 
  submitTeam,
  deleteTeam,
  removeMember,
  getAllApprovedTeams,
  requestToJoinTeam
} from "../controllers/teams.controller";
import { getMatchingStudents } from "../controllers/matching.controller";
import { generateTeamRoadmap, askTeamAI, getTeamAIMessages } from "../controllers/ai.controller";
import { createInvitation, getTeamInvitations } from "../controllers/invitations.controller";
import { requireStudentAuth } from "../middleware/auth.middleware";
import { runValidation, sanitizeBody } from "../middleware/validate";
import { messageLimiter, roadmapLimiter } from "../middleware/rateLimiter";

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

// GET /api/teams (Public Directory Listing for Students)
router.get("/", requireStudentAuth, getAllApprovedTeams);

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

// DELETE /api/teams/:teamId
router.delete("/:teamId", requireStudentAuth, deleteTeam);

// DELETE /api/teams/:teamId/members/:targetStudentId
router.delete("/:teamId/members/:targetStudentId", requireStudentAuth, removeMember);

// GET /api/teams/:teamId/messages
router.get("/:teamId/messages", requireStudentAuth, getTeamMessages);

// POST /api/teams/:teamId/messages
router.post(
  "/:teamId/messages",
  requireStudentAuth,
  messageLimiter,
  body("content").notEmpty().withMessage("Message content is required").isLength({ max: 2000 }).withMessage("Message exceeds maximum length"),
  runValidation,
  sanitizeBody(["content"]),
  createTeamMessage
);

// DELETE /api/teams/:teamId/messages
router.delete("/:teamId/messages", requireStudentAuth, clearTeamMessages);

// DELETE /api/teams/:teamId/messages/:messageId
router.delete("/:teamId/messages/:messageId", requireStudentAuth, deleteTeamMessage);

// GET /api/teams/:teamId/matching-students
router.get("/:teamId/matching-students", requireStudentAuth, getMatchingStudents);

// POST /api/teams/:teamId/submit
router.post("/:teamId/submit", requireStudentAuth, submitTeam);

// POST /api/teams/:teamId/requests
router.post("/:teamId/requests", requireStudentAuth, requestToJoinTeam);

// POST /api/teams/:teamId/ai-plan
router.post("/:teamId/roadmap", requireStudentAuth, roadmapLimiter, generateTeamRoadmap);
router.post("/:teamId/ask-ai", requireStudentAuth, roadmapLimiter, askTeamAI);
router.get("/:teamId/ask-ai", requireStudentAuth, getTeamAIMessages);

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
