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

// GET /api/teams/:teamId/messages
export async function getTeamMessages(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const studentId = req.student?.studentId;
    const { teamId } = req.params;

    if (!studentId) {
      throw new HttpError(401, "Authentication required");
    }

    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: { members: true }
    });

    if (!team) {
      throw new HttpError(404, "Team not found");
    }

    const isMember = team.members.some(m => m.studentId === studentId);
    if (team.leaderId !== studentId && !isMember) {
      throw new HttpError(403, "You do not have permission to view team messages");
    }

    const messages = await prisma.teamMessage.findMany({
      where: { teamId },
      include: {
        sender: {
          select: { id: true, name: true, photo: true }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    res.json({
      success: true,
      data: messages
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/teams/:teamId/messages
export async function createTeamMessage(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const studentId = req.student?.studentId;
    const { teamId } = req.params;
    const { content } = req.body;

    if (!studentId) {
      throw new HttpError(401, "Authentication required");
    }

    if (!content || !content.trim()) {
      throw new HttpError(400, "Message content cannot be empty");
    }

    if (content.length > 2000) {
      throw new HttpError(400, "Message exceeds maximum length");
    }

    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: { members: true }
    });

    if (!team) {
      throw new HttpError(404, "Team not found");
    }

    const isMember = team.members.some(m => m.studentId === studentId);
    if (team.leaderId !== studentId && !isMember) {
      throw new HttpError(403, "You do not have permission to send team messages");
    }

    const message = await prisma.teamMessage.create({
      data: {
        teamId,
        senderId: studentId,
        content: content.trim()
      },
      include: {
        sender: {
          select: { id: true, name: true, photo: true }
        }
      }
    });

    // Notify other members
    const allMembers = [team.leaderId, ...team.members.map(m => m.studentId)];
    // Unique list in case leader is also in members table (should not be, but safe)
    const uniqueMembers = Array.from(new Set(allMembers));
    
    for (const memberId of uniqueMembers) {
      if (memberId !== studentId) {
        await prisma.notification.create({
          data: {
            recipientId: memberId,
            type: "TEAM_MESSAGE",
            title: "New Team Message",
            message: `${message.sender.name} sent a new message in ${team.name}.`,
            referenceId: team.id
          }
        });
      }
    }

    res.status(201).json({
      success: true,
      data: message
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/teams/:teamId/submit
export async function submitTeam(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const studentId = req.student?.studentId;
    const { teamId } = req.params;

    if (!studentId) {
      throw new HttpError(401, "Authentication required");
    }

    const team = await prisma.team.findUnique({
      where: { id: teamId }
    });

    if (!team) {
      throw new HttpError(404, "Team not found");
    }

    if (team.leaderId !== studentId) {
      throw new HttpError(403, "Only the team leader can submit the team for review");
    }

    if (team.approvalStatus === "PENDING_APPROVAL") {
      throw new HttpError(400, "Team is already pending approval");
    }

    if (team.approvalStatus === "APPROVED") {
      throw new HttpError(400, "Team is already approved");
    }

    const updatedTeam = await prisma.team.update({
      where: { id: teamId },
      data: { approvalStatus: "PENDING_APPROVAL" }
    });

    res.json({
      success: true,
      message: "Team submitted for admin review successfully",
      data: updatedTeam
    });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/teams/:teamId
export async function deleteTeam(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const studentId = req.student?.studentId;
    const { teamId } = req.params;

    if (!studentId) throw new HttpError(401, "Authentication required");

    const team = await prisma.team.findUnique({ where: { id: teamId } });
    if (!team) throw new HttpError(404, "Team not found");

    if (team.leaderId !== studentId) {
      throw new HttpError(403, "Only the team leader can delete this team");
    }

    await prisma.$transaction([
        prisma.teamMember.deleteMany({ where: { teamId } }),
        prisma.teamInvitation.deleteMany({ where: { teamId } }),
        prisma.teamMessage.deleteMany({ where: { teamId } }),
        prisma.teamAIMessage.deleteMany({ where: { teamId } }),
        prisma.team.delete({ where: { id: teamId } })
      ]);

    res.json({ success: true, message: "Team deleted successfully" });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/teams/:teamId/members/:targetStudentId
export async function removeMember(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const leaderId = req.student?.studentId;
    const { teamId, targetStudentId } = req.params;

    if (!leaderId) throw new HttpError(401, "Authentication required");
    if (leaderId === targetStudentId) throw new HttpError(400, "You cannot remove yourself");

    const team = await prisma.team.findUnique({ where: { id: teamId } });
    if (!team) throw new HttpError(404, "Team not found");

    if (team.leaderId !== leaderId) {
      throw new HttpError(403, "Only the team leader can remove members");
    }

    const member = await prisma.teamMember.findUnique({
      where: { teamId_studentId: { teamId, studentId: targetStudentId } }
    });

    if (!member) throw new HttpError(404, "Student is not a member of this team");

    await prisma.teamMember.delete({
      where: { teamId_studentId: { teamId, studentId: targetStudentId } }
    });

    res.json({ success: true, message: "Member removed successfully" });
  } catch (err) {
    next(err);
  }
}

// GET /api/teams
export async function getAllApprovedTeams(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const teams = await prisma.team.findMany({
      where: { approvalStatus: "APPROVED" },
      include: {
        leader: { select: { id: true, name: true, email: true } },
        _count: { select: { members: true } }
      },
      orderBy: { createdAt: "desc" }
    });
    res.json({ success: true, data: teams });
  } catch (err) {
    next(err);
  }
}

// POST /api/teams/:teamId/requests
export async function requestToJoinTeam(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const studentId = req.student?.studentId;
    const { teamId } = req.params;

    if (!studentId) throw new HttpError(401, "Authentication required");

    const team = await prisma.team.findUnique({ 
      where: { id: teamId },
      include: { _count: { select: { members: true } } }
    });

    if (!team) throw new HttpError(404, "Team not found");
    if (team.approvalStatus !== "APPROVED") throw new HttpError(400, "Team is not approved yet");
    if (team.leaderId === studentId) throw new HttpError(400, "You are already the leader of this team");
    if (team._count.members >= team.maxSize) throw new HttpError(400, "Team is already full");

    const existingMember = await prisma.teamMember.findUnique({
      where: { teamId_studentId: { teamId, studentId } }
    });
    if (existingMember) throw new HttpError(400, "You are already a member of this team");

    const existingRequest = await prisma.teamInvitation.findFirst({
      where: { teamId, studentId, status: "PENDING" }
    });
    if (existingRequest) throw new HttpError(400, "You already have a pending request or invitation for this team");

    const crypto = require("crypto");
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const newRequest = await prisma.teamInvitation.create({
      data: {
        teamId,
        studentId,
        status: "PENDING",
        token,
        expiresAt
        // Note: we're reusing TeamInvitation. For a request to join, it's effectively a pending record.
        // Usually, the "inviter" is the leader and the "invitee" is the student. 
        // Here, the student created it, but it sits as PENDING for this teamId and studentId.
      }
    });

    // Notify the leader
    await prisma.notification.create({
      data: {
        recipientId: team.leaderId,
        type: "TEAM_INVITATION",
        title: "New Team Join Request",
        message: "A student has requested to join your team.",
        referenceId: team.id
      }
    });

    res.status(201).json({ success: true, message: "Request sent successfully", data: newRequest });
  } catch (err) {
    next(err);
  }
}


// DELETE /api/teams/:teamId/messages
export async function clearTeamMessages(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const studentId = req.student?.studentId;
    const { teamId } = req.params;

    if (!studentId) throw new HttpError(401, "Authentication required");

    const team = await prisma.team.findUnique({ where: { id: teamId } });
    if (!team) throw new HttpError(404, "Team not found");
    if (team.leaderId !== studentId) throw new HttpError(403, "Only the team leader can clear chat");

    await prisma.teamMessage.deleteMany({ where: { teamId } });

    res.json({ success: true, message: "Chat cleared successfully" });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/teams/:teamId/messages/:messageId
export async function deleteTeamMessage(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const studentId = req.student?.studentId;
    const { teamId, messageId } = req.params;

    if (!studentId) throw new HttpError(401, "Authentication required");

    const message = await prisma.teamMessage.findUnique({ where: { id: messageId } });
    if (!message) throw new HttpError(404, "Message not found");
    if (message.senderId !== studentId) throw new HttpError(403, "You can only unsend your own messages");

    await prisma.teamMessage.delete({ where: { id: messageId } });

    res.json({ success: true, message: "Message unsent" });
  } catch (err) {
    next(err);
  }
}
