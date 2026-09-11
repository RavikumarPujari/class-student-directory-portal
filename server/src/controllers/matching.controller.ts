import { Response, NextFunction } from "express";
import { prisma } from "../config/prisma";
import { HttpError } from "../middleware/errorHandler";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { calculateMatch } from "../services/matching.service";

export async function getMatchingStudents(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const leaderId = req.student?.studentId;
    if (!leaderId) throw new HttpError(401, "Authentication required");

    const teamId = req.params.teamId;
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        members: true,
        invitations: {
          where: {
            status: "PENDING",
            expiresAt: { gt: new Date() }
          }
        }
      }
    });

    if (!team) throw new HttpError(404, "Team not found");
    if (team.leaderId !== leaderId) throw new HttpError(403, "Only the team leader can access matching recommendations");

    const excludedStudentIds = new Set<string>();
    excludedStudentIds.add(leaderId);
    team.members.forEach(m => excludedStudentIds.add(m.studentId));
    
    // Annotate pending invitations
    const pendingInvitationMap = new Map<string, string>();
    team.invitations.forEach(inv => {
      pendingInvitationMap.set(inv.studentId, inv.status);
    });

    // Optional filters matching directory architecture
    const { search = "", minimumMatchPercentage = "0" } = req.query as Record<string, string>;
    const minMatch = parseFloat(minimumMatchPercentage) || 0;

    const whereClause: any = {
      id: { notIn: Array.from(excludedStudentIds) }
    };

    if (search) {
      whereClause.OR = [
        { name: { contains: search } },
        { usn: { contains: search } },
        { skills: { contains: search } },
        { favoriteDomain: { contains: search } }
      ];
    }

    const students = await prisma.student.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        usn: true,
        branch: true,
        section: true,
        year: true,
        semester: true,
        photo: true,
        bio: true,
        favoriteDomain: true,
        skills: true,
        linkedin: true,
        github: true,
        portfolio: true
      }
    });

    const matches = students
      .map(student => {
        const matchResult = calculateMatch(student, team.requiredSkills);
        return {
          ...matchResult,
          invitationStatus: pendingInvitationMap.get(student.id) || null
        };
      })
      .filter(m => m.matchPercentage >= minMatch);

    matches.sort((a, b) => {
      if (b.matchPercentage !== a.matchPercentage) {
        return b.matchPercentage - a.matchPercentage;
      }
      if (b.matchCount !== a.matchCount) {
        return b.matchCount - a.matchCount;
      }
      return a.student.name.localeCompare(b.student.name);
    });

    // We can slice to top 50 to avoid sending too much data
    const topMatches = matches.slice(0, 50);

    res.json(topMatches);
  } catch (error) {
    next(error);
  }
}

