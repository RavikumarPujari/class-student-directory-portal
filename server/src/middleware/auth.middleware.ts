import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";
import { JwtPayload } from "../types";

export interface AuthenticatedRequest extends Request {
  admin?: JwtPayload;
  student?: JwtPayload;
}

export function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Authentication required" });
  }

  const token = header.split(" ")[1];

  try {
    const payload = verifyToken(token);

    // Admin-only guard: student JWTs must never access admin endpoints.
    if (payload.studentId || payload.role === "student") {
      return res.status(403).json({ success: false, message: "Admin access required" });
    }

    req.admin = payload;
    next();
  } catch {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
}

export function requireStudentAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Authentication required" });
  }

  const token = header.split(" ")[1];

  try {
    const payload = verifyToken(token);
    if (payload.role !== "student" || !payload.studentId) {
      return res.status(403).json({ success: false, message: "Student access required" });
    }
    req.student = payload;
    next();
  } catch {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
}
