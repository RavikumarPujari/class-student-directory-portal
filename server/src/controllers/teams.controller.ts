import { Response, NextFunction } from "express";
import { prisma } from "../config/prisma";
import { HttpError } from "../middleware/errorHandler";
import { AuthenticatedRequest } from "../middleware/auth.middleware";

// POST /api/teams
export async function createTeam(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const leaderId = req.student?.studentId;

    if (!leaderId) {
      throw new HttpError(401, "Authentication required");
    }

    const { name, description, requiredSkills, maxSize } = req.body;

    const parsedMaxSize = maxSize !== undefined ? parseInt(maxSize, 10) : 5;

    if (parsedMaxSize < 2 || parsedMaxSize > 50) {
      throw new HttpError(400, "Max size must be between 2 and 50");
    }

    const studentExists = await prisma.student.findUnique({
      where: { id: leaderId }
    });
    
    if (!studentExists) {
      throw new HttpError(401, "Authenticated student no longer exists");
    }

    const team = await prisma.$transaction(async (tx) => {
      // 1. Create Team
      const newTeam = await tx.team.create({
        data: {
          name,
          description: description || null,
          requiredSkills: requiredSkills || null,
          maxSize: parsedMaxSize,
          leaderId,
        },
      });

      // 2. Create TeamMember for the creator
      await tx.teamMember.create({
        data: {
          teamId: newTeam.id,
          studentId: leaderId,
        },
      });

      return newTeam;
    });

    res.status(201).json({
      success: true,
      message: "Team created successfully",
      data: team,
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/teams/me
export async function getMyTeams(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const studentId = req.student?.studentId;

    if (!studentId) {
      throw new HttpError(401, "Authentication required");
    }

    const teams = await prisma.team.findMany({
      where: {
        OR: [
          { leaderId: studentId },
          { members: { some: { studentId } } }
        ]
      },
      include: {
        leader: {
          select: { id: true, name: true, usn: true, photo: true, branch: true }
        },
        _count: {
          select: { members: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const safeTeams = teams.map(t => ({
      id: t.id,
      name: t.name,
      description: t.description,
      requiredSkills: t.requiredSkills,
      maxSize: t.maxSize,
      leader: t.leader,
      memberCount: t._count.members,
      isLeader: t.leaderId === studentId,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt
    }));

    res.json({
      success: true,
      data: safeTeams
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/teams/:teamId
export async function getTeam(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const studentId = req.student?.studentId;
    const { teamId } = req.params;

    if (!studentId) {
      throw new HttpError(401, "Authentication required");
    }

    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        leader: {
          select: { id: true, name: true, usn: true, photo: true, branch: true }
        },
        members: {
          include: {
            student: {
              select: { id: true, name: true, usn: true, photo: true, branch: true, email: true, skills: true }
            }
          }
        },
        _count: {
          select: { members: true }
        }
      }
    });

    if (!team) {
      throw new HttpError(404, "Team not found");
    }

    // Security: ensure the student is either the leader or a member.
    const isMember = team.members.some(m => m.studentId === studentId);
    if (team.leaderId !== studentId && !isMember) {
      throw new HttpError(403, "You do not have permission to view this team");
    }

    const safeTeam = {
      id: team.id,
      name: team.name,
      description: team.description,
      requiredSkills: team.requiredSkills,
      maxSize: team.maxSize,
      createdAt: team.createdAt,
      leader: team.leader,
      memberCount: team._count.members,
      members: team.members.map(m => ({
        id: m.student.id,
        name: m.student.name,
        usn: m.student.usn,
        branch: m.student.branch,
        skills: m.student.skills,
        photo: m.student.photo,
        email: m.student.email, // Safe to share email with team members for collaboration
        joinedAt: m.createdAt
      }))
    };

    res.json({
      success: true,
      data: safeTeam
    });
  } catch (err) {
    next(err);
  }
}
