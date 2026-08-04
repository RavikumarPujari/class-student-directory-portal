import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/prisma";

export async function getDashboardStats(req: Request, res: Response, next: NextFunction) {
  try {
    const [total, students, recent] = await Promise.all([
      prisma.student.count(),
      prisma.student.findMany({ select: { section: true, favoriteDomain: true } }),
      prisma.student.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

    const sectionCounts: Record<string, number> = {};
    const domainCounts: Record<string, number> = {};

    for (const s of students) {
      sectionCounts[s.section] = (sectionCounts[s.section] || 0) + 1;
      domainCounts[s.favoriteDomain] = (domainCounts[s.favoriteDomain] || 0) + 1;
    }

    const toChartArray = (record: Record<string, number>) =>
      Object.entries(record)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

    res.json({
      success: true,
      data: {
        totalStudents: total,
        sectionWise: toChartArray(sectionCounts),
        domainWise: toChartArray(domainCounts),
        recentRegistrations: recent,
      },
    });
  } catch (err) {
    next(err);
  }
}
