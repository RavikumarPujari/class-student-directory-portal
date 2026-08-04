import jwt, { SignOptions } from "jsonwebtoken";
import { JwtPayload } from "../types";

const JWT_SECRET: string = process.env.JWT_SECRET || "";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1d";

if (!JWT_SECRET) {
  // Fail fast — never allow the app to run with an empty signing secret.
  throw new Error("JWT_SECRET is not defined in environment variables");
}

export function signToken(payload: JwtPayload): string {
  const options: SignOptions = { expiresIn: JWT_EXPIRES_IN as SignOptions["expiresIn"] };
  return jwt.sign(payload, JWT_SECRET, options);
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}
