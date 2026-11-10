import { Response, NextFunction } from "express";
import crypto from "crypto";
import { prisma } from "../config/prisma";
import { HttpError } from "../middleware/errorHandler";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { sendTeamInvitationEmail } from "../services/email.service";

// POST /api/teams/:teamId/invitations
export async function createInvitation(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const leaderId = req.student?.studentId;
    const { teamId } = req.params;
    const { studentId: targetStudentId } = req.body;

    if (!leaderId) {
      throw new HttpError(401, "Authentication required");
    }

    if (!targetStudentId) {
      throw new HttpError(400, "Target student ID is required");
    }

    if (leaderId === targetStudentId) {
      throw new HttpError(400, "You cannot invite yourself");
    }

    // Wrap in a transaction to enforce capacity safely
    const invitation = await prisma.$transaction(async (tx) => {
      // 1. Verify team exists, get leader and current member count
      const team = await tx.team.findUnique({
        where: { id: teamId },
        include: { 
          _count: { select: { members: true } },
          leader: { select: { name: true } }
        }
      });

      if (!team) {
        throw new HttpError(404, "Team not found");
      }

      // 2. Verify current student is team leader
      if (team.leaderId !== leaderId) {
        throw new HttpError(403, "Only the team leader can send invitations");
      }

      // 3. Verify capacity
      if (team._count.members >= team.maxSize) {
        throw new HttpError(400, "Team has reached its maximum size");
      }

      // 4. Verify target student exists
      const targetStudent = await tx.student.findUnique({
        where: { id: targetStudentId }
      });

      if (!targetStudent) {
        throw new HttpError(404, "Target student not found");
      }

      // 5. Verify target is not already a member
      const existingMember = await tx.teamMember.findUnique({
        where: {
          teamId_studentId: {
            teamId,
            studentId: targetStudentId
          }
        }
      });

      if (existingMember) {
        throw new HttpError(400, "Student is already a member of this team");
      }

      // 6. Check for duplicate pending invitation
      const pendingInvites = await tx.teamInvitation.findMany({
        where: {
          teamId,
          studentId: targetStudentId,
          status: "PENDING"
        }
      });

      if (pendingInvites.length > 0) {
        throw new HttpError(400, "A pending invitation already exists for this student");
      }

      // 7. Create invitation
      const token = crypto.randomBytes(32).toString("hex");
      // Give it a 7-day expiry (as an example of expiry info)
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      const newInvite = await tx.teamInvitation.create({
        data: {
          teamId,
          studentId: targetStudentId,
          status: "PENDING",
          token,
          expiresAt
        }
      });

      await tx.notification.create({
        data: {
          recipientId: targetStudentId,
          type: "TEAM_INVITATION",
          title: "New Team Invitation",
          message: `You have been invited to join ${team.name}.`,
          referenceId: team.id
        }
      });

      return {
        newInvite,
        team,
        leaderName: team.leader.name,
        targetEmail: targetStudent.email,
        targetName: targetStudent.name
      };
    });

    // Send email asynchronously outside the transaction to prevent holding the DB lock
    try {
      await sendTeamInvitationEmail({
        toEmail: invitation.targetEmail,
        studentName: invitation.targetName,
        teamName: invitation.team.name,
        leaderName: invitation.leaderName,
        description: invitation.team.description || "",
        requiredSkills: invitation.team.requiredSkills || "",
        token: invitation.newInvite.token
      });
    } catch (emailErr) {
      console.error("Invitation created but email delivery failed.", emailErr);
      // We do not fail the request; the invitation is already safely created in DB.
    }

    res.status(201).json({
      success: true,
      message: "Invitation created successfully",
      data: {
        id: invitation.newInvite.id,
        teamId: invitation.newInvite.teamId,
        studentId: invitation.newInvite.studentId,
        status: invitation.newInvite.status,
        expiresAt: invitation.newInvite.expiresAt,
        createdAt: invitation.newInvite.createdAt
      }
    });

  } catch (err: any) {
    // Handle Prisma unique constraint manually just in case
    if (err.code === "P2002") {
      return next(new HttpError(400, "A pending invitation already exists"));
    }
    next(err);
  }
}

// GET /api/teams/:teamId/invitations
export async function getTeamInvitations(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const leaderId = req.student?.studentId;
    const { teamId } = req.params;

    if (!leaderId) {
      throw new HttpError(401, "Authentication required");
    }

    const team = await prisma.team.findUnique({
      where: { id: teamId }
    });

    if (!team) {
      throw new HttpError(404, "Team not found");
    }

    if (team.leaderId !== leaderId) {
      throw new HttpError(403, "Only the team leader can view invitations");
    }

    const invitations = await prisma.teamInvitation.findMany({
      where: { teamId },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            usn: true,
            branch: true,
            photo: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const safeInvitations = invitations.map(inv => ({
      id: inv.id,
      student: inv.student,
      status: inv.status,
      expiresAt: inv.expiresAt,
      createdAt: inv.createdAt,
      updatedAt: inv.updatedAt
    }));

    res.json({
      success: true,
      data: safeInvitations
    });
  } catch (err) {
    next(err);
  }
}

