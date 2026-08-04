import { Request, Response, NextFunction } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";
import { HttpError } from "../middleware/errorHandler";
import { studentsToCsv, studentsToExcelBuffer } from "../utils/export";

// POST /students — public self-registration endpoint
export async function createStudent(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, usn, section, phone, email, linkedin, github, portfolio, favoriteDomain, skills, bio, photo } =
      req.body;

    const usnUpper = usn.toUpperCase();

    const existing = await prisma.student.findFirst({
      where: { OR: [{ usn: usnUpper }, { email: email.toLowerCase() }] },
    });

    if (existing) {
      const field = existing.usn === usnUpper ? "USN" : "email";
      throw new HttpError(409, `A student with this ${field} is already registered`);
    }

    const student = await prisma.student.create({
      data: {
        name,
        usn: usnUpper,
        section: section.toUpperCase(),
        phone,
        email: email.toLowerCase(),
        linkedin,
        github,
        portfolio: portfolio || null,
        favoriteDomain,
        skills,
        bio: bio || null,
        photo: photo || null,
      },
    });

    res.status(201).json({ success: true, message: "Registration successful", data: student });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return next(new HttpError(409, "A student with this USN or email already exists"));
    }
    next(err);
  }
}

// GET /students — public directory: search, filter, sort, pagination
export async function getStudents(req: Request, res: Response, next: NextFunction) {
  try {
    const {
      search = "",
      section,
      favoriteDomain,
      sortBy = "createdAt",
      order = "desc",
      page = "1",
      limit = "9",
    } = req.query as Record<string, string>;

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 9));

    const where: Prisma.StudentWhereInput = {
      AND: [
        search
          ? {
              OR: [
                { name: { contains: search } },
                { usn: { contains: search } },
                { skills: { contains: search } },
                { favoriteDomain: { contains: search } },
              ],
            }
          : {},
        section ? { section } : {},
        favoriteDomain ? { favoriteDomain } : {},
      ],
    };

    const allowedSortFields = ["name", "usn", "section", "createdAt", "favoriteDomain"];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";

    const [students, total] = await Promise.all([
      prisma.student.findMany({
        where,
        orderBy: { [sortField]: order === "asc" ? "asc" : "desc" },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
      }),
      prisma.student.count({ where }),
    ]);

    res.json({
      success: true,
      data: students,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    });
  } catch (err) {
    next(err);
  }
}

// GET /students/:id
export async function getStudentById(req: Request, res: Response, next: NextFunction) {
  try {
    const student = await prisma.student.findUnique({ where: { id: req.params.id } });
    if (!student) throw new HttpError(404, "Student not found");
    res.json({ success: true, data: student });
  } catch (err) {
    next(err);
  }
}

// PUT /students/:id — protected (admin only)
export async function updateStudent(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const existing = await prisma.student.findUnique({ where: { id } });
    if (!existing) throw new HttpError(404, "Student not found");

    const { name, usn, section, phone, email, linkedin, github, portfolio, favoriteDomain, skills, bio, photo } =
      req.body;

    const usnUpper = usn.toUpperCase();
    const emailLower = email.toLowerCase();

    const duplicate = await prisma.student.findFirst({
      where: {
        id: { not: id },
        OR: [{ usn: usnUpper }, { email: emailLower }],
      },
    });
    if (duplicate) {
      const field = duplicate.usn === usnUpper ? "USN" : "email";
      throw new HttpError(409, `Another student already uses this ${field}`);
    }

    const updated = await prisma.student.update({
      where: { id },
      data: {
        name,
        usn: usnUpper,
        section: section.toUpperCase(),
        phone,
        email: emailLower,
        linkedin,
        github,
        portfolio: portfolio || null,
        favoriteDomain,
        skills,
        bio: bio || null,
        photo: photo ?? existing.photo,
      },
    });

    res.json({ success: true, message: "Student updated", data: updated });
  } catch (err) {
    next(err);
  }
}

// DELETE /students/:id — protected (admin only)
export async function deleteStudent(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const existing = await prisma.student.findUnique({ where: { id } });
    if (!existing) throw new HttpError(404, "Student not found");

    await prisma.student.delete({ where: { id } });
    res.json({ success: true, message: "Student deleted" });
  } catch (err) {
    next(err);
  }
}

// GET /students/export/csv — protected (admin only)
export async function exportCsv(req: Request, res: Response, next: NextFunction) {
  try {
    const students = await prisma.student.findMany({ orderBy: { createdAt: "desc" } });
    const csv = studentsToCsv(students);
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="students-${Date.now()}.csv"`);
    res.status(200).send(csv);
  } catch (err) {
    next(err);
  }
}

// GET /students/export/excel — protected (admin only)
export async function exportExcel(req: Request, res: Response, next: NextFunction) {
  try {
    const students = await prisma.student.findMany({ orderBy: { createdAt: "desc" } });
    const buffer = await studentsToExcelBuffer(students);
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", `attachment; filename="students-${Date.now()}.xlsx"`);
    res.status(200).send(buffer);
  } catch (err) {
    next(err);
  }
}

// GET /students/meta/filters — distinct sections & domains for filter dropdowns
export async function getFilterOptions(req: Request, res: Response, next: NextFunction) {
  try {
    const [sections, domains] = await Promise.all([
      prisma.student.findMany({ select: { section: true }, distinct: ["section"] }),
      prisma.student.findMany({ select: { favoriteDomain: true }, distinct: ["favoriteDomain"] }),
    ]);
    res.json({
      success: true,
      data: {
        sections: sections.map((s: { section: string }) => s.section).sort(),
        domains: domains.map((d: { favoriteDomain: string }) => d.favoriteDomain).sort(),
      },
    });
  } catch (err) {
    next(err);
  }
}
