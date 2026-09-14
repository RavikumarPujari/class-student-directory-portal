import { Response, NextFunction } from "express";
import { prisma } from "../config/prisma";
import { HttpError } from "../middleware/errorHandler";
import { AuthenticatedRequest } from "../middleware/auth.middleware";

// GET /api/team-invitations/me
export async function getMyInvitations(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const studentId = req.student?.studentId;
    if (!studentId) throw new HttpError(401, "Authentication required");

    const invitations = await prisma.teamInvitation.findMany({
      where: { studentId },
      include: {
        team: {
          select: {
            name: true,
            description: true,
            requiredSkills: true,
            maxSize: true,
            _count: { select: { members: true } },
            leader: { select: { name: true, photo: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const safeInvitations = invitations.map(inv => ({
      id: inv.id,
      token: inv.token,
      teamId: inv.teamId,
      teamName: inv.team.name,
      teamDescription: inv.team.description,
      team: {
        memberCount: inv.team._count.members,
        maxSize: inv.team.maxSize,
        requiredSkills: inv.team.requiredSkills
      },
      leader: inv.team.leader,
      status: inv.status,
      expiresAt: inv.expiresAt,
      createdAt: inv.createdAt
    }));

    res.json({ success: true, data: safeInvitations });
  } catch (err) {
    next(err);
  }
}

// POST /api/team-invitations/:token/accept
export async function acceptInvitation(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const studentId = req.student?.studentId;
    const { token } = req.params;
    
    if (!studentId) throw new HttpError(401, "Authentication required");

    // Fetch invitation
    const invitation = await prisma.teamInvitation.findUnique({
      where: { token },
      include: { team: { include: { _count: { select: { members: true } } } } }
    });

    if (!invitation) throw new HttpError(404, "Invalid invitation token");

    // Security constraints
    if (invitation.studentId !== studentId) {
      throw new HttpError(403, "This invitation belongs to another student");
    }

    if (invitation.status === "ACCEPTED") {
      throw new HttpError(400, "Invitation already accepted");
    }

    if (invitation.status === "DECLINED") {
      throw new HttpError(400, "Invitation already declined");
    }

    if (invitation.status !== "PENDING") {
      throw new HttpError(400, "Invitation is no longer pending");
    }

    if (new Date() > new Date(invitation.expiresAt)) {
      throw new HttpError(400, "Invitation has expired");
    }

    // Atomic transaction
    await prisma.$transaction(async (tx) => {
      // Re-verify capacity in lock
      const team = await tx.team.findUnique({
        where: { id: invitation.teamId },
        include: { 
          _count: { select: { members: true } },
          members: true
        }
      });

      if (!team) throw new HttpError(404, "Team no longer exists");

      if (team._count.members >= team.maxSize) {
        throw new HttpError(400, "Team has reached its maximum size");
      }

      // Check if already a member
      const existingMember = await tx.teamMember.findUnique({
        where: { teamId_studentId: { teamId: team.id, studentId } }
      });

      if (existingMember) {
        throw new HttpError(400, "You are already a member of this team");
      }

      // 1. Create TeamMember
      await tx.teamMember.create({
        data: { teamId: team.id, studentId }
      });

      // 2. Change status to ACCEPTED
      await tx.teamInvitation.update({
        where: { id: invitation.id },
        data: { status: "ACCEPTED" }
      });

      const joiningStudent = await tx.student.findUnique({
        where: { id: studentId }
      });

      // 3. Notify Leader
      if (team.leaderId !== studentId) {
        await tx.notification.create({
          data: {
            recipientId: team.leaderId,
            type: "INVITATION_ACCEPTED",
            title: "Invitation Accepted",
            message: `${joiningStudent?.name} accepted your invitation to ${team.name}.`,
            referenceId: team.id
          }
        });
      }

      // 4. Notify other members
      for (const member of team.members) {
        if (member.studentId !== studentId && member.studentId !== team.leaderId) {
          await tx.notification.create({
            data: {
              recipientId: member.studentId,
              type: "TEAM_MEMBER_JOINED",
              title: "New Team Member",
              message: `${joiningStudent?.name} joined ${team.name}.`,
              referenceId: team.id
            }
          });
        }
      }
    });

    res.json({ success: true, message: "Invitation accepted successfully" });
  } catch (err) {
    next(err);
  }
}

// POST /api/team-invitations/:token/decline
export async function declineInvitation(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const studentId = req.student?.studentId;
    const { token } = req.params;
    
    if (!studentId) throw new HttpError(401, "Authentication required");

    // Fetch invitation
    const invitation = await prisma.teamInvitation.findUnique({
      where: { token }
    });

    if (!invitation) throw new HttpError(404, "Invalid invitation token");

    // Security constraints
    if (invitation.studentId !== studentId) {
      throw new HttpError(403, "This invitation belongs to another student");
    }

    if (invitation.status === "ACCEPTED") {
      throw new HttpError(400, "Invitation already accepted");
    }

    if (invitation.status === "DECLINED") {
      throw new HttpError(400, "Invitation already declined");
    }

    if (invitation.status !== "PENDING") {
      throw new HttpError(400, "Invitation is no longer pending");
    }

    if (new Date() > new Date(invitation.expiresAt)) {
      throw new HttpError(400, "Invitation has expired");
    }

    await prisma.$transaction(async (tx) => {
      await tx.teamInvitation.update({
        where: { id: invitation.id },
        data: { status: "DECLINED" }
      });

      const team = await tx.team.findUnique({
        where: { id: invitation.teamId }
      });
      
      const decliningStudent = await tx.student.findUnique({
        where: { id: studentId }
      });

      if (team && decliningStudent) {
        await tx.notification.create({
          data: {
            recipientId: team.leaderId,
            type: "INVITATION_DECLINED",
            title: "Invitation Declined",
            message: `${decliningStudent.name} declined your invitation to ${team.name}.`,
            referenceId: team.id
          }
        });
      }
    });

    res.json({ success: true, message: "Invitation declined successfully" });
  } catch (err) {
    next(err);
  }
}

