import { Router } from "express";
import {
  sendRegistrationOtp,
  verifyRegistrationOtp,
  resendRegistrationOtp,
  sendProfileVerificationOtp,
  verifyProfileOtp,
} from "../controllers/studentVerification.controller";
import { otpSendLimiter, otpVerifyLimiter } from "../middleware/rateLimiter";
import { requireStudentAuth } from "../middleware/auth.middleware";

const router = Router();

// Public registration OTP flow
router.post("/send-otp", otpSendLimiter, sendRegistrationOtp);
router.post("/verify-otp", otpVerifyLimiter, verifyRegistrationOtp);
router.post("/resend-otp", otpSendLimiter, resendRegistrationOtp);

// Authenticated legacy profile OTP flow
router.post("/profile-send-otp", requireStudentAuth, otpSendLimiter, sendProfileVerificationOtp);
router.post("/profile-verify-otp", requireStudentAuth, otpVerifyLimiter, verifyProfileOtp);

export default router;

