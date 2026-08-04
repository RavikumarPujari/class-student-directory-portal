export interface JwtPayload {
  adminId: string;
  email: string;
}

export interface StudentInput {
  name: string;
  usn: string;
  section: string;
  phone: string;
  email: string;
  linkedin: string;
  github: string;
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
