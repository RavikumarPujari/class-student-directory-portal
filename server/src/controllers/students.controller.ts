
import { Request, Response, NextFunction } from "express";
import { Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import { prisma } from "../config/prisma";
import { HttpError } from "../middleware/errorHandler";
import { studentsToCsv, studentsToExcelBuffer } from "../utils/export";
import { logAccess } from "../utils/audit";

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
    } = req.body;

const usnUpper = (usn || "").toUpperCase();
    const emailLower = (email || "").toLowerCase();
    const phoneTrimmed = (phone || "").trim();

    // Distinct uniqueness checks so each field gets a clear, specific message.
    const existingUsn = await prisma.student.findUnique({ where: { usn: usnUpper } });
    if (existingUsn) {
      throw new HttpError(409, "This USN already exists.");
    }

    const existingEmail = await prisma.student.findUnique({ where: { email: emailLower } });
    if (existingEmail) {
      throw new HttpError(409, "This email is already registered.");
    }

    let existingPhone = null;
    if (phoneTrimmed) {
      existingPhone = await prisma.student.findFirst({ where: { phone: phoneTrimmed } });
      if (existingPhone) {
        throw new HttpError(409, "This mobile number is already registered.");
      }
    }

    // Hash the password only if provided (keeps backward compatibility for existing flows).
    // New registrations requiring student login must supply a password.
    let passwordHash: string | null = null;
    if (password) {
      passwordHash = await bcrypt.hash(password, 12);
    }

    const student = await prisma.student.create({
      data: {
        name,
        usn: usnUpper,
        section: section ? section.toUpperCase() : null,
        branch: branch || null,
        year: year || null,
        semester: semester ? parseInt(semester, 10) : null,
        phone: phoneTrimmed || null,
        email: email.toLowerCase(),
        linkedin: linkedin || null,
        github: github || null,
        portfolio: portfolio || null,
        favoriteDomain: favoriteDomain || null,
        skills: skills || null,
        bio: bio || null,
        photo: photo || null,
        passwordHash,
      },
    });

    // Never return the password hash to the client.
    const { passwordHash: _ph, ...safeStudent } = student;

    res.status(201).json({ success: true, message: "Registration successful", data: safeStudent });
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
    // deleteMany removes all rows atomically and returns the count deleted.
    const { count } = await prisma.student.deleteMany({});

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
