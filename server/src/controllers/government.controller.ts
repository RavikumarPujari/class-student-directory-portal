import { Response, NextFunction } from "express";
import { prisma } from "../config/prisma";
import { AuthenticatedRequest } from "../middleware/auth.middleware";

export async function getGovernmentStats(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const totalStudents = await prisma.student.count();
    const studentsByBranch = await prisma.student.groupBy({
      by: ['branch'],
      _count: { branch: true }
    });
        const recentRegistrations = await prisma.student.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, branch: true, createdAt: true }
    });
    const studentsByYear = await prisma.student.groupBy({
      by: ['year'],
      _count: { year: true }
    });

    res.json({
      success: true,
      data: {
        totalStudents,
        studentsByBranch: studentsByBranch.map(b => ({ branch: b.branch, count: b._count.branch })),
        studentsByYear: studentsByYear.map(y => ({ year: y.year, count: y._count.year })),
        recentRegistrations
      }
    });
  } catch (err) {
    next(err);
  }
}
