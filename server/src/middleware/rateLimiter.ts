import rateLimit from "express-rate-limit";

// General API limiter — generous, protects against abuse without hurting normal use.
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === "test",
  message: { success: false, message: "Too many requests, please try again later." },
});

// Strict limiter for the login endpoint to slow brute-force attempts.
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === "test",
  message: {
    success: false,
    message: "Too many login attempts. Please try again in 15 minutes.",
  },
});

// Strict limiter for the student login endpoint to slow brute-force attempts.
export const studentLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === "test",
  message: {
    success: false,
    message: "Too many login attempts. Please try again in 15 minutes.",
  },
});

// Slightly stricter limiter for public write endpoints (student self-registration).
export const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === "test",
  message: {
    success: false,
    message: "Too many submissions from this device. Please try again later.",
  },
});
export const messageLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20, // 20 messages per minute
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === "test",
  message: {
    success: false,
    message: "Too many messages sent. Please slow down.",
  },
});

export const roadmapLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === "test",
  message: {
    success: false,
    message: "Too many roadmap generations. Please try again in an hour.",
  },
});

// Strict limiter for sending/resending OTPs (5 requests per 15 minutes per IP)
export const otpSendLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === "test",
  message: {
    success: false,
    message: "Too many verification code requests. Please try again in 15 minutes.",
  },
});

// Strict limiter for OTP verification attempts (10 requests per 15 minutes per IP)
export const otpVerifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === "test",
  message: {
    success: false,
    message: "Too many verification attempts. Please try again in 15 minutes.",
  },
});


