import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import { prisma } from "../config/prisma";
import { HttpError } from "../middleware/errorHandler";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { sendOtpEmail } from "../services/email.service";

const USN_REGEX = /^[A-Za-z0-9]{6,15}$/;

/**
 * Computes HMAC-SHA256 hash of the 6-digit OTP bound to the student email.
 * OTP_SECRET is strictly mandatory with zero insecure fallbacks.
 */
export function hashOtp(email: string, otp: string): string {
  const secret = process.env.OTP_SECRET;
  if (!secret || secret.trim() === "") {
    throw new Error("Server configuration error: OTP_SECRET environment variable is missing.");
  }
  return crypto.createHmac("sha256", secret).update(`${email.toLowerCase()}:${otp}`).digest("hex");
}

/**
 * Computes SHA-256 hash of the raw verification token so raw tokens are never stored in the database.
 */
export function hashVerifyToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/**
 * POST /api/students/verification/send-otp
 * Step 1: Validates student details and dispatches a 6-digit OTP to their Gmail.
 */
export async function sendRegistrationOtp(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, usn, email } = req.body;

    const trimmedName = (name || "").trim();
    const usnUpper = (usn || "").trim().toUpperCase();
    const emailLower = (email || "").trim().toLowerCase();

    // 1. Validate fields
    if (!trimmedName || trimmedName.length < 2 || trimmedName.length > 100) {
      throw new HttpError(422, "Full name must be between 2 and 100 characters.");
    }

    if (!usnUpper || !USN_REGEX.test(usnUpper)) {
      throw new HttpError(422, "Enter a valid USN (letters/numbers, 6-15 characters).");
    }

    if (!emailLower || !emailLower.endsWith("@gmail.com")) {
      throw new HttpError(422, "Please provide a valid Gmail address ending with @gmail.com.");
    }

    // 2. Check for existing student with duplicate USN or email
    const existingUsn = await prisma.student.findUnique({ where: { usn: usnUpper } });
    if (existingUsn) {
      throw new HttpError(409, "This USN is already registered. Please log in instead.");
    }

    const existingEmail = await prisma.student.findUnique({ where: { email: emailLower } });
    if (existingEmail) {
      throw new HttpError(409, "This Gmail address is already registered. Please log in instead.");
    }

    // 3. Check resend cooldown on pending verification (60 seconds)
    const existingVerification = await prisma.emailVerification.findUnique({
      where: { email: emailLower },
    });

    if (existingVerification && Date.now() - existingVerification.lastSentAt.getTime() < 60000) {
      const waitSec = Math.ceil((60000 - (Date.now() - existingVerification.lastSentAt.getTime())) / 1000);
      throw new HttpError(429, `Please wait ${waitSec} seconds before requesting another verification code.`);
    }

    // 4. Generate cryptographically secure 6-digit OTP
    const otp = crypto.randomInt(100000, 1000000).toString();
    const otpHashed = hashOtp(emailLower, otp);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5-minute expiry

    // 5. Store HMAC-SHA256 hash in database
    await prisma.emailVerification.upsert({
      where: { email: emailLower },
      update: {
        name: trimmedName,
        usn: usnUpper,
        otpHashed,
        attempts: 0,
        expiresAt,
        lastSentAt: new Date(),
        isVerified: false,
        verifyTokenHashed: null,
        tokenExpiresAt: null,
      },
      create: {
        email: emailLower,
        name: trimmedName,
        usn: usnUpper,
        otpHashed,
        attempts: 0,
        expiresAt,
        lastSentAt: new Date(),
        isVerified: false,
      },
    });

    // 6. Send OTP email using existing Nodemailer infrastructure
    await sendOtpEmail({
      toEmail: emailLower,
      studentName: trimmedName,
      otp,
    });

    res.json({
      success: true,
      message: "Verification code sent to your Gmail address.",
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/students/verification/verify-otp
 * Step 2: Validates the 6-digit OTP, invalidates it, and returns a single-use verification token.
 */
export async function verifyRegistrationOtp(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, otp } = req.body;

    const emailLower = (email || "").trim().toLowerCase();
    const otpClean = (otp || "").trim();

    if (!emailLower || !otpClean) {
      throw new HttpError(400, "Email address and 6-digit verification code are required.");
    }

    const verification = await prisma.emailVerification.findUnique({
      where: { email: emailLower },
    });

    if (!verification) {
      throw new HttpError(400, "No pending verification found for this email. Please request a new code.");
    }

    // Check expiration
    if (verification.expiresAt < new Date()) {
      throw new HttpError(400, "Verification code has expired (5-minute limit). Please request a new code.");
    }

    // Check attempts limit (max 5)
    if (verification.attempts >= 5) {
      throw new HttpError(429, "Too many incorrect attempts. For security, please request a new verification code.");
    }

    // Verify HMAC-SHA256 hash
    const submittedHash = hashOtp(emailLower, otpClean);
    if (!verification.otpHashed || submittedHash !== verification.otpHashed) {
      const newAttempts = verification.attempts + 1;
      await prisma.emailVerification.update({
        where: { id: verification.id },
        data: { attempts: newAttempts },
      });

      const remaining = 5 - newAttempts;
      if (remaining <= 0) {
        throw new HttpError(429, "Too many incorrect attempts. Please request a new verification code.");
      }
      throw new HttpError(400, `Invalid verification code. ${remaining} attempt${remaining === 1 ? "" : "s"} remaining.`);
    }

    // Generate secure single-use verification token
    const rawVerifyToken = crypto.randomBytes(32).toString("hex");
    const verifyTokenHashed = hashVerifyToken(rawVerifyToken);
    const tokenExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes to complete Step 3

    // Invalidate OTP immediately to prevent reuse, and store only hashed token
    await prisma.emailVerification.update({
      where: { id: verification.id },
      data: {
        isVerified: true,
        otpHashed: "", // Cleared to prevent reuse
        verifyTokenHashed,
        tokenExpiresAt,
      },
    });

    res.json({
      success: true,
      message: "Email verified successfully.",
      verifyToken: rawVerifyToken,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/students/verification/resend-otp
 * Resends a fresh 6-digit OTP subject to a 60-second cooldown.
 */
export async function resendRegistrationOtp(req: Request, res: Response, next: NextFunction) {
  try {
    const { email } = req.body;
    const emailLower = (email || "").trim().toLowerCase();

    if (!emailLower) {
      throw new HttpError(400, "Email address is required.");
    }

    const verification = await prisma.emailVerification.findUnique({
      where: { email: emailLower },
    });

    if (!verification) {
      throw new HttpError(404, "No verification in progress for this email address.");
    }

    // Enforce 60-second cooldown
    if (Date.now() - verification.lastSentAt.getTime() < 60000) {
      const waitSec = Math.ceil((60000 - (Date.now() - verification.lastSentAt.getTime())) / 1000);
      throw new HttpError(429, `Please wait ${waitSec} seconds before requesting a new code.`);
    }

    const otp = crypto.randomInt(100000, 1000000).toString();
    const otpHashed = hashOtp(emailLower, otp);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await prisma.emailVerification.update({
      where: { id: verification.id },
      data: {
        otpHashed,
        attempts: 0,
        expiresAt,
        lastSentAt: new Date(),
        isVerified: false,
        verifyTokenHashed: null,
        tokenExpiresAt: null,
      },
    });

    await sendOtpEmail({
      toEmail: emailLower,
      studentName: verification.name || "Student",
      otp,
    });

    res.json({
      success: true,
      message: "A new verification code has been sent to your Gmail address.",
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/students/verification/profile-send-otp
 * Authenticated endpoint: Sends an OTP to verify a legacy unverified student account.
 */
export async function sendProfileVerificationOtp(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const studentId = req.student?.studentId;
    if (!studentId) throw new HttpError(401, "Authentication required.");

    const student = await prisma.student.findUnique({ where: { id: studentId } });
    if (!student) throw new HttpError(404, "Student not found.");

    if (student.isEmailVerified) {
      throw new HttpError(400, "Your email is already verified.");
    }

    const emailLower = student.email.toLowerCase();

    // Check 60-second cooldown
    const existing = await prisma.emailVerification.findUnique({ where: { email: emailLower } });
    if (existing && Date.now() - existing.lastSentAt.getTime() < 60000) {
      const waitSec = Math.ceil((60000 - (Date.now() - existing.lastSentAt.getTime())) / 1000);
      throw new HttpError(429, `Please wait ${waitSec} seconds before requesting another code.`);
    }

    const otp = crypto.randomInt(100000, 1000000).toString();
    const otpHashed = hashOtp(emailLower, otp);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await prisma.emailVerification.upsert({
      where: { email: emailLower },
      update: {
        name: student.name,
        usn: student.usn,
        otpHashed,
        attempts: 0,
        expiresAt,
        lastSentAt: new Date(),
        isVerified: false,
        verifyTokenHashed: null,
        tokenExpiresAt: null,
      },
      create: {
        email: emailLower,
        name: student.name,
        usn: student.usn,
        otpHashed,
        attempts: 0,
        expiresAt,
        lastSentAt: new Date(),
        isVerified: false,
      },
    });

    await sendOtpEmail({
      toEmail: emailLower,
      studentName: student.name,
      otp,
    });

    res.json({
      success: true,
      message: `Verification code sent to ${student.email}.`,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/students/verification/profile-verify-otp
 * Authenticated endpoint: Verifies OTP for the logged-in student and marks isEmailVerified = true.
 */
export async function verifyProfileOtp(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const studentId = req.student?.studentId;
    if (!studentId) throw new HttpError(401, "Authentication required.");

    const student = await prisma.student.findUnique({ where: { id: studentId } });
    if (!student) throw new HttpError(404, "Student not found.");

    if (student.isEmailVerified) {
      return res.json({ success: true, message: "Email is already verified." });
    }

    const { otp } = req.body;
    const otpClean = (otp || "").trim();
    if (!otpClean) throw new HttpError(400, "Verification code is required.");

    const emailLower = student.email.toLowerCase();
    const verification = await prisma.emailVerification.findUnique({ where: { email: emailLower } });

    if (!verification) {
      throw new HttpError(400, "No pending verification found. Please request a verification code.");
    }

    if (verification.expiresAt < new Date()) {
      throw new HttpError(400, "Verification code has expired. Please request a new code.");
    }

    if (verification.attempts >= 5) {
      throw new HttpError(429, "Too many incorrect attempts. Please request a new code.");
    }

    const submittedHash = hashOtp(emailLower, otpClean);
    if (!verification.otpHashed || submittedHash !== verification.otpHashed) {
      const newAttempts = verification.attempts + 1;
      await prisma.emailVerification.update({
        where: { id: verification.id },
        data: { attempts: newAttempts },
      });
      const remaining = 5 - newAttempts;
      throw new HttpError(400, `Invalid verification code. ${remaining > 0 ? `${remaining} attempts remaining.` : "Please request a new code."}`);
    }

    // Atomically mark student as verified and delete the verification record
    await prisma.$transaction(async (tx) => {
      await tx.student.update({
        where: { id: studentId },
        data: { isEmailVerified: true },
      });
      await tx.emailVerification.delete({
        where: { id: verification.id },
      });
    });

    res.json({
      success: true,
      message: "Your email has been verified successfully!",
    });
  } catch (err) {
    next(err);
  }
}
