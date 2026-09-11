import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../config/prisma";
import { HttpError } from "../middleware/errorHandler";
import { signToken } from "../utils/jwt";
import { AuthenticatedRequest } from "../middleware/auth.middleware";

// POST /api/students/auth/login — student login
export async function loginStudent(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new HttpError(400, "Email and password are required");
    }

const student = await prisma.student.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!student || !student.passwordHash) {
      throw new HttpError(401, "Invalid email or password");
    }

    const valid = await bcrypt.compare(password, student.passwordHash);

    if (!valid) {
      throw new HttpError(401, "Invalid email or password");
    }

// Record the last successful login timestamp asynchronously so it doesn't block the response.
    prisma.student.update({
      where: { id: student.id },
      data: { lastLoginAt: new Date() },
    }).catch(err => console.error("Failed to update lastLoginAt:", err));

    const token = signToken({
      studentId: student.id,
      email: student.email,
      role: "student",
    });

    res.json({ success: true, message: "Login successful", token });
  } catch (err) {
    next(err);
  }
}

// GET /api/students/auth/me — current student profile (protected)
export async function getMe(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const studentId = req.student?.studentId;
    if (!studentId) throw new HttpError(401, "Not authenticated");

    const student = await prisma.student.findUnique({ where: { id: studentId } });
    if (!student) throw new HttpError(404, "Student not found");

    const { passwordHash: _ph, ...safeStudent } = student;
    res.json({ success: true, data: safeStudent });
  } catch (err) {
    next(err);
  }
}

// PUT /api/students/auth/me — update own profile (protected)
export async function updateMe(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const studentId = req.student?.studentId;
    if (!studentId) throw new HttpError(401, "Not authenticated");

    const existing = await prisma.student.findUnique({ where: { id: studentId } });
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
      password,
    } = req.body;

// USN and email are permanent identifiers — never editable after registration.
    const usnUpper = existing.usn;
    const emailLower = existing.email;
    const phoneTrimmed = (phone || existing.phone).trim();

    // Prevent a student from taking another student's phone number.
    const duplicate = await prisma.student.findFirst({
      where: {
        id: { not: studentId },
        phone: phoneTrimmed,
      },
    });
    if (duplicate) {
      throw new HttpError(409, "Another student already uses this mobile number");
    }

    let passwordHash = existing.passwordHash;
    if (password) {
      passwordHash = await bcrypt.hash(password, 12);
    }

const updated = await prisma.student.update({
      where: { id: studentId },
      data: {
        name: name ?? existing.name,
        usn: usnUpper,
        section: (section || existing.section).toUpperCase(),
        branch: branch ?? existing.branch,
        year: year ?? existing.year,
        semester: semester !== undefined ? parseInt(semester, 10) : existing.semester,
        phone: phone ?? existing.phone,
        email: emailLower,
        linkedin: linkedin ?? existing.linkedin,
        github: github ?? existing.github,
        portfolio: portfolio ?? existing.portfolio,
favoriteDomain: favoriteDomain ?? existing.favoriteDomain,
        skills: skills ?? existing.skills,
        bio: bio ?? existing.bio,
        photo: photo ?? existing.photo,
        passwordHash,
      },
    });

    const { passwordHash: _ph, ...safeStudent } = updated;
    res.json({ success: true, message: "Profile updated", data: safeStudent });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/students/auth/me — delete own profile permanently (protected)
export async function deleteMe(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const studentId = req.student?.studentId;
    if (!studentId) throw new HttpError(401, "Not authenticated");

    await prisma.student.delete({ where: { id: studentId } });
    res.json({ success: true, message: "Account permanently deleted" });
  } catch (err) {
    next(err);
  }
}
