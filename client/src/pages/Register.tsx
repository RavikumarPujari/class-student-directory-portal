import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, UserPlus, Mail, ShieldCheck, Lock, ArrowLeft, RotateCcw, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/useToast";
import {
  sendRegistrationOtp,
  verifyRegistrationOtp,
  resendRegistrationOtp,
  registerStudent,
} from "@/services/students.service";
import { getErrorMessage } from "@/services/api";

const USN_REGEX = /^[A-Za-z0-9]{6,15}$/;

export function Register() {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1: Student details
  const [name, setName] = useState("");
  const [usn, setUsn] = useState("");
  const [email, setEmail] = useState("");
  const [step1Error, setStep1Error] = useState<string | null>(null);

  // Step 2: OTP verification
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const [otpTimer, setOtpTimer] = useState<number>(300); // 5 minutes
  const [resendCooldown, setResendCooldown] = useState<number>(60); // 60 seconds
  const [verifyToken, setVerifyToken] = useState<string>("");

  // Step 3: Password creation
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Loading & success
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const { toast } = useToast();
  const navigate = useNavigate();

  // 5-minute validity timer & 60-second resend cooldown timer
  useEffect(() => {
    if (step !== 2) return;

    const interval = setInterval(() => {
      setOtpTimer((prev) => (prev > 0 ? prev - 1 : 0));
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [step]);

  // Focus first OTP input on transition to Step 2
  useEffect(() => {
    if (step === 2) {
      setTimeout(() => {
        otpInputsRef.current[0]?.focus();
      }, 100);
    }
  }, [step]);

  // Format seconds as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // --- Step 1: Send OTP ---
  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setStep1Error(null);

    const trimmedName = name.trim();
    const upperUsn = usn.trim().toUpperCase();
    const lowerEmail = email.trim().toLowerCase();

    if (!trimmedName || trimmedName.length < 2 || trimmedName.length > 100) {
      setStep1Error("Full Name must be between 2 and 100 characters.");
      return;
    }

    if (!upperUsn || !USN_REGEX.test(upperUsn)) {
      setStep1Error("Enter a valid USN (letters and numbers, 6-15 characters).");
      return;
    }

    if (!lowerEmail || !lowerEmail.endsWith("@gmail.com")) {
      setStep1Error("Please provide a valid Gmail address ending with @gmail.com.");
      return;
    }

    setIsSubmitting(true);
    try {
      await sendRegistrationOtp({
        name: trimmedName,
        usn: upperUsn,
        email: lowerEmail,
      });

      setOtp(["", "", "", "", "", ""]);
      setOtpTimer(300);
      setResendCooldown(60);
      setStep(2);
      toast({
        title: "Verification code sent!",
        description: `We've sent a 6-digit code to ${lowerEmail}.`,
        variant: "success",
      });
    } catch (err) {
      setStep1Error(getErrorMessage(err));
      toast({
        title: "Verification failed",
        description: getErrorMessage(err),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  // --- Step 2: Handle OTP input changes & paste ---
  function handleOtpChange(index: number, value: string) {
    const cleanVal = value.replace(/[^0-9]/g, "");
    if (!cleanVal) {
      const updated = [...otp];
      updated[index] = "";
      setOtp(updated);
      return;
    }

    const digit = cleanVal.slice(-1);
    const updated = [...otp];
    updated[index] = digit;
    setOtp(updated);

    // Auto-focus next input
    if (index < 5 && digit) {
      otpInputsRef.current[index + 1]?.focus();
    }
  }

  function handleOtpKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  }

  function handleOtpPaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/[^0-9]/g, "").slice(0, 6);
    if (pasted.length === 6) {
      const updated = pasted.split("");
      setOtp(updated);
      otpInputsRef.current[5]?.focus();
    }
  }

  // --- Step 2: Verify OTP ---
  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    const code = otp.join("");
    if (code.length !== 6) {
      toast({
        title: "Incomplete code",
        description: "Please enter all 6 digits of the verification code.",
        variant: "destructive",
      });
      return;
    }

    if (otpTimer <= 0) {
      toast({
        title: "OTP Expired",
        description: "Your verification code has expired. Please request a new one.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await verifyRegistrationOtp({
        email: email.trim().toLowerCase(),
        otp: code,
      });

      setVerifyToken(result.verifyToken);
      setStep(3);
      toast({
        title: "Gmail Verified!",
        description: "Your email has been confirmed. Now create your password.",
        variant: "success",
      });
    } catch (err) {
      toast({
        title: "Invalid OTP",
        description: getErrorMessage(err),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  // --- Step 2: Resend OTP ---
  async function handleResendCode() {
    if (resendCooldown > 0 || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await resendRegistrationOtp({
        email: email.trim().toLowerCase(),
      });

      setOtp(["", "", "", "", "", ""]);
      setOtpTimer(300);
      setResendCooldown(60);
      toast({
        title: "New code sent!",
        description: `A fresh 6-digit code was sent to ${email}.`,
        variant: "success",
      });
      otpInputsRef.current[0]?.focus();
    } catch (err) {
      toast({
        title: "Resend failed",
        description: getErrorMessage(err),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  // --- Step 3: Create Password & Complete Registration ---
  async function handleFinalSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError(null);

    if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      await registerStudent({
        name: name.trim(),
        usn: usn.trim().toUpperCase(),
        email: email.trim().toLowerCase(),
        password,
        verifyToken,
      });

      setSuccess(true);
      toast({
        title: "Registration successful!",
        description: "Your account is created and your Gmail is verified. You can now log in.",
        variant: "success",
      });
    } catch (err) {
      setPasswordError(getErrorMessage(err));
      toast({
        title: "Registration failed",
        description: getErrorMessage(err),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  // --- Success Screen ---
  if (success) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center py-16 px-4 bg-[#f3f6fb]">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="max-w-md text-center rounded-2xl border border-slate-200/90 bg-white shadow-xl shadow-slate-900/5">
            <CardContent className="p-8 sm:p-10">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-500/20">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h2 className="mt-6 font-display text-2xl font-bold tracking-tight text-slate-900">You're all set!</h2>
              <p className="mt-2 text-xs sm:text-sm text-slate-500 leading-relaxed">
                Your student account has been created with a verified Gmail address. You can now sign in to browse teams, explore the directory, and set up your student profile.
              </p>
              <div className="mt-8 flex flex-col gap-2.5 sm:flex-row">
                <Button className="flex-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs h-11" onClick={() => navigate("/student/login")}>
                  Log In to Dashboard
                </Button>
                <Button variant="outline" className="flex-1 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 text-xs h-11" onClick={() => navigate("/directory")}>
                  View Directory
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[85vh] items-center justify-center py-12 px-4 bg-[#f3f6fb]">
      <div className="w-full max-w-lg">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          
          {/* Header */}
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 ring-1 ring-indigo-500/20 shadow-xs">
              <UserPlus className="h-7 w-7 text-indigo-600" />
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900">Student Registration</h1>
            <p className="mt-1 text-slate-500 text-xs sm:text-sm">
              Join the Class Directory with secure Gmail OTP verification
            </p>

            {/* Stepper indicator */}
            <div className="mt-5 flex items-center justify-center gap-2">
              <div className={`h-1.5 rounded-full transition-all duration-300 ${step >= 1 ? "w-10 bg-indigo-600" : "w-6 bg-slate-200"}`} />
              <div className={`h-1.5 rounded-full transition-all duration-300 ${step >= 2 ? "w-10 bg-indigo-600" : "w-6 bg-slate-200"}`} />
              <div className={`h-1.5 rounded-full transition-all duration-300 ${step >= 3 ? "w-10 bg-indigo-600" : "w-6 bg-slate-200"}`} />
            </div>
          </div>

          <Card className="rounded-2xl border border-slate-200/90 bg-white shadow-xl shadow-slate-900/5 overflow-hidden">
            <AnimatePresence mode="wait">
              
              {/* STEP 1: Student Details */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  transition={{ duration: 0.2 }}
                >
                  <CardHeader className="pt-6 px-6 sm:px-8 pb-3">
                    <CardTitle className="text-lg font-bold text-slate-900 font-display">Step 1 — Student Details</CardTitle>
                    <CardDescription className="text-xs text-slate-500">
                      Enter your identity details to request an instant verification code
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="px-6 sm:px-8 pb-8 pt-2">
                    <form onSubmit={handleSendOtp} className="space-y-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="name" className="text-xs font-semibold text-slate-700">Full Name</Label>
                        <Input
                          id="name"
                          placeholder="e.g. Ravikumar Pujari"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                          disabled={isSubmitting}
                          className="h-10 rounded-xl border-slate-200 bg-slate-50/50 text-sm focus:bg-white focus:border-indigo-500 focus:ring-indigo-500"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="usn" className="text-xs font-semibold text-slate-700">University Serial Number (USN)</Label>
                        <Input
                          id="usn"
                          placeholder="e.g. 2VX25CS001"
                          value={usn}
                          onChange={(e) => setUsn(e.target.value.toUpperCase())}
                          required
                          disabled={isSubmitting}
                          className="h-10 rounded-xl border-slate-200 bg-slate-50/50 text-sm uppercase font-mono focus:bg-white focus:border-indigo-500 focus:ring-indigo-500"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="email" className="text-xs font-semibold text-slate-700">Gmail Address</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="student@gmail.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          disabled={isSubmitting}
                          className="h-10 rounded-xl border-slate-200 bg-slate-50/50 text-sm focus:bg-white focus:border-indigo-500 focus:ring-indigo-500"
                        />
                        <p className="text-[11px] text-slate-400">Must be a valid @gmail.com address.</p>
                      </div>

                      {step1Error && (
                        <p className="text-xs font-medium text-rose-600 bg-rose-50 border border-rose-200 p-2.5 rounded-xl">
                          {step1Error}
                        </p>
                      )}

                      <div className="pt-2">
                        <Button
                          type="submit"
                          size="lg"
                          className="w-full h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <span className="flex items-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin" /> Sending Code...
                            </span>
                          ) : (
                            <span className="flex items-center justify-center gap-1.5">
                              <Mail className="h-4 w-4" /> Verify Gmail
                            </span>
                          )}
                        </Button>
                      </div>

                      <div className="text-center pt-2 border-t border-slate-100">
                        <p className="text-xs text-slate-500">
                          Already have an account?{" "}
                          <button
                            type="button"
                            onClick={() => navigate("/student/login")}
                            className="font-semibold text-indigo-600 hover:underline"
                          >
                            Sign in here
                          </button>
                        </p>
                      </div>
                    </form>
                  </CardContent>
                </motion.div>
              )}

              {/* STEP 2: Gmail OTP Verification */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  transition={{ duration: 0.2 }}
                >
                  <CardHeader className="pt-6 px-6 sm:px-8 pb-3">
                    <CardTitle className="text-lg font-bold text-slate-900 font-display flex items-center gap-2">
                      <ShieldCheck className="h-5 w-5 text-indigo-600" />
                      Verify Your Email
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-500">
                      We sent a 6-digit code to <strong className="text-slate-800">{email}</strong>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="px-6 sm:px-8 pb-8 pt-2">
                    <form onSubmit={handleVerifyOtp} className="space-y-5">
                      
                      {/* 6 OTP Inputs */}
                      <div className="flex justify-center gap-2 sm:gap-2.5 py-2">
                        {otp.map((digit, index) => (
                          <input
                            key={index}
                            ref={(el) => (otpInputsRef.current[index] = el)}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleOtpChange(index, e.target.value)}
                            onKeyDown={(e) => handleOtpKeyDown(index, e)}
                            onPaste={handleOtpPaste}
                            disabled={isSubmitting}
                            className="h-12 w-11 sm:h-13 sm:w-12 text-center text-xl font-bold font-mono rounded-xl border border-slate-200 bg-slate-50/70 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                          />
                        ))}
                      </div>

                      {/* Timer and Resend Controls */}
                      <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2 pt-2 border-t border-slate-100">
                        <div className="flex items-center gap-1.5">
                          <span className={`inline-block h-2 w-2 rounded-full ${otpTimer > 60 ? "bg-emerald-500" : "bg-rose-500 animate-pulse"}`} />
                          <span>Expires in: <strong className="font-mono text-slate-800">{formatTime(otpTimer)}</strong></span>
                        </div>

                        <button
                          type="button"
                          onClick={handleResendCode}
                          disabled={resendCooldown > 0 || isSubmitting}
                          className={`flex items-center gap-1 font-semibold text-xs transition-colors ${
                            resendCooldown > 0 ? "text-slate-400 cursor-not-allowed opacity-60" : "text-indigo-600 hover:underline cursor-pointer"
                          }`}
                        >
                          <RotateCcw className="h-3 w-3" />
                          {resendCooldown > 0 ? `Resend code (${resendCooldown}s)` : "Resend code"}
                        </button>
                      </div>

                      <Button
                        type="submit"
                        size="lg"
                        className="w-full h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs"
                        disabled={isSubmitting || otp.join("").length !== 6 || otpTimer <= 0}
                      >
                        {isSubmitting ? (
                          <span className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" /> Verifying...
                          </span>
                        ) : (
                          "Verify OTP Code"
                        )}
                      </Button>

                      {/* Return to step 1 */}
                      <div className="text-center pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setStep(1);
                            setStep1Error(null);
                          }}
                          className="text-xs text-slate-500 hover:text-indigo-600 inline-flex items-center gap-1 transition-colors"
                        >
                          <ArrowLeft className="h-3 w-3" /> Edit email address
                        </button>
                      </div>
                    </form>
                  </CardContent>
                </motion.div>
              )}

              {/* STEP 3: Create Password */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  transition={{ duration: 0.2 }}
                >
                  <CardHeader className="pt-6 px-6 sm:px-8 pb-3">
                    <CardTitle className="text-lg font-bold text-slate-900 font-display flex items-center gap-2">
                      <Lock className="h-5 w-5 text-indigo-600" />
                      Set Account Password
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-500">
                      Email verified. Choose a secure password to complete your account setup.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="px-6 sm:px-8 pb-8 pt-2">
                    <form onSubmit={handleFinalSubmit} className="space-y-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="password" className="text-xs font-semibold text-slate-700">Password</Label>
                        <Input
                          id="password"
                          type="password"
                          placeholder="At least 8 characters"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          autoComplete="new-password"
                          required
                          disabled={isSubmitting}
                          className="h-10 rounded-xl border-slate-200 bg-slate-50/50 text-sm focus:bg-white focus:border-indigo-500 focus:ring-indigo-500"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="confirmPassword" className="text-xs font-semibold text-slate-700">Confirm Password</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          placeholder="Confirm your password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          autoComplete="new-password"
                          required
                          disabled={isSubmitting}
                          className="h-10 rounded-xl border-slate-200 bg-slate-50/50 text-sm focus:bg-white focus:border-indigo-500 focus:ring-indigo-500"
                        />
                      </div>

                      {passwordError && (
                        <p className="text-xs font-medium text-rose-600 bg-rose-50 border border-rose-200 p-2.5 rounded-xl">
                          {passwordError}
                        </p>
                      )}

                      <div className="pt-2">
                        <Button
                          type="submit"
                          size="lg"
                          className="w-full h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs"
                          disabled={isSubmitting || !password || !confirmPassword}
                        >
                          {isSubmitting ? (
                            <span className="flex items-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin" /> Creating Account...
                            </span>
                          ) : (
                            "Create Account"
                          )}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </motion.div>
              )}

            </AnimatePresence>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
export default Register;
