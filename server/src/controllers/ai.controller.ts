import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { prisma } from "../config/prisma";
import { HttpError } from "../middleware/errorHandler";
import { generateProjectRoadmap } from "../services/ai.service";

// POST /api/teams/:teamId/roadmap
export async function generateTeamRoadmap(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const studentId = req.student?.studentId;
    const { teamId } = req.params;

    if (!studentId) {
      throw new HttpError(401, "Authentication required");
    }

    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        members: {
          include: { student: true }
        },
      }
    });

    if (!team) {
      throw new HttpError(404, "Team not found");
    }

    // Verify membership
    const isMember = team.members.some(m => m.studentId === studentId);
    if (!isMember && team.leaderId !== studentId) {
      throw new HttpError(403, "Only team members can generate an AI roadmap");
    }

    // Aggregate skills
    const skillSet = new Set<string>();
    if (team.requiredSkills) {
      team.requiredSkills.split(",").map(s => s.trim()).filter(Boolean).forEach(s => skillSet.add(s));
    }
    
    team.members.forEach(m => {
      const { branch, year, favoriteDomain, skills } = m.student;
      if (branch) skillSet.add(branch);
      if (year) skillSet.add(year);
      if (favoriteDomain) skillSet.add(favoriteDomain);
      if (skills) {
        skills.split(",").map(s => s.trim()).filter(Boolean).forEach(s => skillSet.add(s));
      }
    });

    const memberSkills = Array.from(skillSet);

    // Call Gemini
    const plan = await generateProjectRoadmap(team.name, team.description || "", memberSkills);

    // Save to DB
    await prisma.team.update({
      where: { id: teamId },
      data: {
        roadmap: plan,
        roadmapGeneratedAt: new Date()
      }
    });

    res.json({
      success: true,
      message: "AI Roadmap generated successfully",
      data: plan
    });
  } catch (err: any) {
    if (err.message?.includes("GEMINI_API_KEY")) {
       return next(new HttpError(500, "AI Service is not configured. Please add GEMINI_API_KEY to the server env."));
    }
    next(new HttpError(500, "Failed to generate AI roadmap. " + (err.message || "")));
  }
}

// POST /api/teams/:teamId/ask-ai
export async function askTeamAI(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const studentId = req.student?.studentId;
    const { teamId } = req.params;
    const { question } = req.body;

    if (!studentId) throw new HttpError(401, "Authentication required");
    if (!question || typeof question !== 'string') throw new HttpError(400, "Question is required");

    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        members: {
          include: { student: true }
        },
      }
    });

    if (!team) throw new HttpError(404, "Team not found");

    const isMember = team.members.some(m => m.studentId === studentId);
    if (!isMember && team.leaderId !== studentId) {
      throw new HttpError(403, "Only team members can ask the AI mentor");
    }

    const skillSet = new Set<string>();
    if (team.requiredSkills) {
      team.requiredSkills.split(",").map(s => s.trim()).filter(Boolean).forEach(s => skillSet.add(s));
    }
    
    team.members.forEach(m => {
      const { branch, year, favoriteDomain, skills } = m.student;
      if (branch) skillSet.add(branch);
      if (year) skillSet.add(year);
      if (favoriteDomain) skillSet.add(favoriteDomain);
      if (skills) {
        skills.split(",").map(s => s.trim()).filter(Boolean).forEach(s => skillSet.add(s));
      }
    });

    const memberSkills = Array.from(skillSet);

    const { askAIAssistant } = require('../services/ai.service');
    const answer = await askAIAssistant(team.name, team.description || "", memberSkills, question);

    const message = await prisma.teamAIMessage.create({
      data: {
        teamId,
        askedByStudentId: studentId,
        question,
        answer
      },
      include: {
        student: {
          select: { name: true, photo: true }
        }
      }
    });

    res.json({
      success: true,
      message: "AI Answer generated successfully",
      data: message
    });
  } catch (err: any) {
    if (err.message?.includes("GEMINI_API_KEY")) {
       return next(new HttpError(500, "AI Service is not configured. Please add GEMINI_API_KEY to the server env."));
    }
    next(new HttpError(500, "Failed to get AI answer. " + (err.message || "")));
  }
}

// GET /api/teams/:teamId/ask-ai
export async function getTeamAIMessages(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const studentId = req.student?.studentId;
    const { teamId } = req.params;

    if (!studentId) throw new HttpError(401, "Authentication required");

    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: { members: true }
    });

    if (!team) throw new HttpError(404, "Team not found");

    const isMember = team.members.some(m => m.studentId === studentId);
    if (!isMember && team.leaderId !== studentId) {
      throw new HttpError(403, "Only team members can view AI messages");
    }

    const messages = await prisma.teamAIMessage.findMany({
      where: { teamId },
      orderBy: { createdAt: 'asc' },
      include: {
        student: {
          select: { name: true, photo: true }
        }
      }
    });

    res.json({ success: true, data: messages });
  } catch (err) {
    next(err);
  }
}
