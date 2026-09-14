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
  const token = (req.cookies && req.cookies.token) || (header && header.startsWith("Bearer ") ? header.split(" ")[1] : null);

  if (!token) {
    return res.status(401).json({ success: false, message: "Authentication required" });
  }

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
  const token = (req.cookies && req.cookies.token) || (header && header.startsWith("Bearer ") ? header.split(" ")[1] : null);

  if (!token) {
    return res.status(401).json({ success: false, message: "Authentication required" });
  }

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
export function requireAnyAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const header = req.headers.authorization;
  const token = (req.cookies && req.cookies.token) || (header && header.startsWith("Bearer ") ? header.split(" ")[1] : null);

  if (!token) {
    return res.status(401).json({ success: false, message: "Authentication required" });
  }

  try {
    const payload = verifyToken(token);
    if (payload.role === "student" && payload.studentId) {
      req.student = payload;
    } else {
      req.admin = payload;
    }
    next();
  } catch {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
}
export function requireGovernmentAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const header = req.headers.authorization;
  const token = (req.cookies && req.cookies.token) || (header && header.startsWith("Bearer ") ? header.split(" ")[1] : null);

  if (!token) {
    return res.status(401).json({ success: false, message: "Authentication required" });
  }

  try {
    const payload = verifyToken(token);
    if (payload.role !== "government") {
      return res.status(403).json({ success: false, message: "Government access required" });
    }
    req.admin = payload; // Can share the admin property for simplicity, or add government property.
    next();
  } catch {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
}
