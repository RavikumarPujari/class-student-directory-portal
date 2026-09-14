import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../config/prisma";
import { signToken } from "../utils/jwt";
import { HttpError } from "../middleware/errorHandler";

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body as { email: string; password: string };

    const admin = await prisma.admin.findUnique({ where: { email } });

    // Use a generic message for both "not found" and "wrong password" to avoid
    // leaking which emails are registered (user enumeration protection).
    if (!admin) {
      throw new HttpError(401, "Invalid email or password");
    }

    const isMatch = await bcrypt.compare(password, admin.passwordHash);
    if (!isMatch) {
      throw new HttpError(401, "Invalid email or password");
    }

    const token = signToken({ adminId: admin.id, email: admin.email, role: admin.role as "admin" | "government" });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    });

    res.json({
      success: true,
      message: "Login successful",
      data: {
        token,
        admin: { id: admin.id, email: admin.email, name: admin.name },
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function me(req: Request, res: Response, next: NextFunction) {
  try {
    const adminId = (req as any).admin?.adminId;
    const admin = await prisma.admin.findUnique({
      where: { id: adminId },
      select: { id: true, email: true, name: true, createdAt: true },
    });
    if (!admin) throw new HttpError(404, "Admin not found");
    res.json({ success: true, data: admin });
  } catch (err) {
    next(err);
  }
}

export async function adminLogout(req: Request, res: Response, next: NextFunction) {
  res.clearCookie("token");
  res.json({ success: true, message: "Logged out" });
}
