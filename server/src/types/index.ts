export interface JwtPayload {
  adminId?: string;
  studentId?: string;
  email: string;
  role?: "admin" | "student";
}

export interface StudentInput {
  name: string;
  usn: string;
  section: string;
  branch: string;
  year: string;
  semester: number;
  phone: string;
  email: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
  favoriteDomain: string;
  skills: string; // comma-separated on the wire
  bio?: string;
  photo?: string;
}

export interface ApiError extends Error {
  statusCode?: number;
  details?: unknown;
}
