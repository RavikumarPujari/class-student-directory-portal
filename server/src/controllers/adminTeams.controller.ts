import { Response, NextFunction } from "express";
import { prisma } from "../config/prisma";
import { HttpError } from "../middleware/errorHandler";

export async function getPendingTeams(req: any, res: Response, next: NextFunction) {
  try {
    const teams = await prisma.team.findMany({
      where: { approvalStatus: "PENDING_APPROVAL" },
      include: {
        leader: { select: { name: true, email: true } },
        _count: { select: { members: true } }
      },
      orderBy: { updatedAt: "asc" }
    });
    res.json({ success: true, data: teams });
  } catch (err) {
    next(err);
  }
}

export async function getAllTeams(req: any, res: Response, next: NextFunction) {
  try {
    const teams = await prisma.team.findMany({
      include: {
        leader: { select: { name: true, email: true } },
        _count: { select: { members: true } }
      },
      orderBy: { createdAt: "desc" }
    });
    res.json({ success: true, data: teams });
  } catch (err) {
    next(err);
  }
}

export async function reviewTeam(req: any, res: Response, next: NextFunction) {
  try {
    const { teamId } = req.params;
    const { status } = req.body;

    if (status !== "APPROVED" && status !== "REJECTED") {
      throw new HttpError(400, "Invalid status. Must be APPROVED or REJECTED.");
    }

    const team = await prisma.team.findUnique({ where: { id: teamId } });
    if (!team) throw new HttpError(404, "Team not found");
    if (team.approvalStatus !== "PENDING_APPROVAL") {
      throw new HttpError(400, "Team is not pending approval");
    }

    const updatedTeam = await prisma.team.update({
      where: { id: teamId },
      data: { approvalStatus: status }
    });

    res.json({ success: true, data: updatedTeam, message: `Team ${status.toLowerCase()} successfully` });
  } catch (err) {
    next(err);
  }
}

