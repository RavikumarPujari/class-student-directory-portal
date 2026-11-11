
import { Request, Response, NextFunction } from "express";
import { Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import { prisma } from "../config/prisma";
import { HttpError } from "../middleware/errorHandler";
import { studentsToCsv, studentsToExcelBuffer } from "../utils/export";
import { logAccess } from "../utils/audit";
import { hashVerifyToken } from "./studentVerification.controller";

// POST /students — public self-registration endpoint
// POST /students — public self-registration endpoint
export async function createStudent(req: Request, res: Response, next: NextFunction) {
  try {
    const {
      name,
      usn,
      section,
      branch,
      year,
      semester,
      phone,
      email,
      linkedin,
      github,
      portfolio,
      favoriteDomain,
      skills,
      bio,
      photo,
      password,
      verifyToken,
    } = req.body;

    const usnUpper = (usn || "").toUpperCase();
    const emailLower = (email || "").toLowerCase();
    const phoneTrimmed = (phone || "").trim();

    // Verify verification token for public registration
    const isAdmin = !!(req as any).admin;
    if (!isAdmin) {
      if (!verifyToken || typeof verifyToken !== "string") {
        throw new HttpError(403, "Email verification is required before creating an account. Please verify your Gmail address.");
      }
    }

    // Hash password if provided
    let passwordHash: string | null = null;
    if (password) {
      passwordHash = await bcrypt.hash(password, 12);
    }

    // Atomic transaction: verify token, check duplicates, create student, and consume token
    const student = await prisma.$transaction(async (tx) => {
      // 1. If not admin, validate and consume verification token
      if (!isAdmin) {
        const verifyTokenHashed = hashVerifyToken(verifyToken);
        const verification = await tx.emailVerification.findFirst({
          where: {
            email: emailLower,
            verifyTokenHashed,
            isVerified: true,
            tokenExpiresAt: { gt: new Date() },
          },
        });

        if (!verification) {
          throw new HttpError(403, "Email verification has expired or is invalid. Please verify your Gmail address again.");
        }

        // Delete/consume verification record immediately within transaction
        await tx.emailVerification.delete({ where: { id: verification.id } });
      }

      // 2. Recheck duplicate USN and email inside transaction to eliminate race conditions
      const existingUsn = await tx.student.findUnique({ where: { usn: usnUpper } });
      if (existingUsn) {
        throw new HttpError(409, "This USN is already registered.");
      }

      const existingEmail = await tx.student.findUnique({ where: { email: emailLower } });
      if (existingEmail) {
        throw new HttpError(409, "This email is already registered.");
      }

      if (phoneTrimmed) {
        const existingPhone = await tx.student.findFirst({ where: { phone: phoneTrimmed } });
        if (existingPhone) {
          throw new HttpError(409, "This mobile number is already registered.");
        }
      }

      // 3. Create student with isEmailVerified = true
      return await tx.student.create({
        data: {
          name,
          usn: usnUpper,
          section: section ? section.toUpperCase() : null,
          branch: branch || null,
          year: year || null,
          semester: semester ? parseInt(semester, 10) : null,
          phone: phoneTrimmed || null,
          email: emailLower,
          linkedin: linkedin || null,
          github: github || null,
          portfolio: portfolio || null,
          favoriteDomain: favoriteDomain || null,
          skills: skills || null,
          bio: bio || null,
          photo: photo || null,
          passwordHash,
          isEmailVerified: true,
        },
      });
    });

    const { passwordHash: _ph, ...safeStudent } = student;
    return res.status(201).json({ success: true, message: "Registration successful", data: safeStudent });
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

    if ((req as any).admin) {
      await logAccess(req, "list_students");
    }

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

    // Never expose password hashes in the public directory.
    const safeStudents = students.map(({ passwordHash: _ph, ...rest }) => rest);

    res.json({
      success: true,
      data: safeStudents,
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
    const { passwordHash: _ph, ...safeStudent } = student;
    res.json({ success: true, data: safeStudent });
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

const {
      name,
      usn,
      section,
      branch,
      year,
      semester,
      phone,
      email,
      linkedin,
      github,
      portfolio,
      favoriteDomain,
      skills,
      bio,
      photo,
    } = req.body;

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
        section: section ? section.toUpperCase() : null,
        branch: branch || null,
        year: year || null,
        semester: semester ? parseInt(semester, 10) : null,
        phone: phone || null,
        email: emailLower,
        linkedin: linkedin || null,
        github: github || null,
        portfolio: portfolio || null,
        favoriteDomain: favoriteDomain || null,
        skills: skills || null,
        bio: bio || null,
        photo: photo ?? existing.photo,
      },
    });

    const { passwordHash: _ph, ...safeUpdated } = updated;
    res.json({ success: true, message: "Student updated", data: safeUpdated });
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

// DELETE /students/clear-all — protected (admin only)
export async function clearAllStudents(req: Request, res: Response, next: NextFunction) {
  try {
    // Safely remove all student-related dependent records and students in an atomic transaction
    const count = await prisma.$transaction(async (tx) => {
      await tx.teamMessage.deleteMany({});
      await tx.teamAIMessage.deleteMany({});
      await tx.notification.deleteMany({});
      await tx.teamInvitation.deleteMany({});
      await tx.teamMember.deleteMany({});
      await tx.team.deleteMany({});
      await tx.emailVerification.deleteMany({});
      const { count: studentCount } = await tx.student.deleteMany({});
      return studentCount;
    });

    if (count === 0) {
      return res.json({ success: true, message: "No students to clear", data: { count: 0 } });
    }

    res.json({
      success: true,
      message: `Removed ${count} student${count > 1 ? "s" : ""}`,
      data: { count },
    });
  } catch (err) {
    next(err);
  }
}

// GET /students/export/csv — protected (admin only)
export async function exportCsv(req: Request, res: Response, next: NextFunction) {
  try {
    await logAccess(req, "export_csv");
    const students = await prisma.student.findMany({ orderBy: { createdAt: "desc" } });
    const safeStudents = students.map(({ passwordHash: _ph, ...rest }) => rest);
    const csv = studentsToCsv(safeStudents as any);
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="students-${Date.now()}.csv"`);
    res.status(200).send(csv);
  } catch (err) {
    next(err);
  }
}

// GET /students/export/excel - protected (admin only)
export async function exportExcel(req: Request, res: Response, next: NextFunction) {
  try {
    await logAccess(req, "export_excel");
    const students = await prisma.student.findMany({ orderBy: { createdAt: "desc" } });
    const safeStudents = students.map(({ passwordHash: _ph, ...rest }) => rest);
    const buffer = await studentsToExcelBuffer(safeStudents as any);
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
        sections: sections.map((s: { section: string | null }) => s.section).filter(Boolean).sort(),
        domains: domains.map((d: { favoriteDomain: string | null }) => d.favoriteDomain).filter(Boolean).sort(),
      },
    });
  } catch (err) {
    next(err);
  }
}

// GET /students/check-email — frontend live validation
export async function checkEmail(req: Request, res: Response, next: NextFunction) {
  try {
    const { email } = req.query;
    if (!email || typeof email !== "string") {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const student = await prisma.student.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true }, // Optimization: don't fetch full row
    });

    res.json({ success: true, exists: !!student });
  } catch (err) {
    next(err);
  }
}
