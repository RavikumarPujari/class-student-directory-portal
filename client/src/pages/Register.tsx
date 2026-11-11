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
    const fullOtp = otp.join("");
    if (fullOtp.length !== 6) {
      toast({
        title: "Incomplete code",
        description: "Please enter all 6 digits of the verification code.",
        variant: "destructive",
      });
      return;
    }

    if (otpTimer <= 0) {
      toast({
        title: "Code expired",
        description: "Your verification code has expired. Please click Resend Code.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await verifyRegistrationOtp({
        email: email.trim().toLowerCase(),
        otp: fullOtp,
      });

      setVerifyToken(res.verifyToken);
      setStep(3);
      toast({
        title: "Email verified!",
        description: "Now create a password to finalize your account.",
        variant: "success",
      });
    } catch (err) {
      toast({
        title: "Verification failed",
        description: getErrorMessage(err),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  // --- Step 2: Resend OTP ---
  async function handleResendCode() {
    if (resendCooldown > 0) return;

    setIsSubmitting(true);
    try {
      await resendRegistrationOtp({ email: email.trim().toLowerCase() });
      setOtp(["", "", "", "", "", ""]);
      setOtpTimer(300);
      setResendCooldown(60);
      toast({
        title: "New code sent!",
        description: "A fresh 6-digit verification code was sent to your Gmail.",
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
      <div className="container flex min-h-[70vh] items-center justify-center py-16">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="max-w-md text-center border-border bg-card">
            <CardContent className="p-10">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-teal/10 text-teal">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h2 className="mt-6 font-display text-2xl font-bold text-foreground">You're all set!</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Your account has been created with a verified Gmail address. You can now log in to access teams, find classmates, and complete your profile.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button className="flex-1 bg-teal hover:bg-teal/90 text-black font-semibold" onClick={() => navigate("/student/login")}>
                  Log In Now
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => navigate("/directory")}>
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
    <div className="container max-w-xl py-16">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        
        {/* Header */}
        <div className="mb-8 text-center">
          <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-teal/10 text-teal">
            <UserPlus className="h-6 w-6" />
          </span>
          <h1 className="font-display text-3xl font-extrabold sm:text-4xl text-foreground">Student Registration</h1>
          <p className="mt-2 text-muted-foreground text-sm">
            Join the Class Directory with secure Gmail OTP verification.
          </p>

          {/* Stepper indicator */}
          <div className="mt-6 flex items-center justify-center gap-2">
            <div className={`h-2 rounded-full transition-all duration-300 ${step >= 1 ? "w-10 bg-teal" : "w-6 bg-muted"}`} />
            <div className={`h-2 rounded-full transition-all duration-300 ${step >= 2 ? "w-10 bg-teal" : "w-6 bg-muted"}`} />
            <div className={`h-2 rounded-full transition-all duration-300 ${step >= 3 ? "w-10 bg-teal" : "w-6 bg-muted"}`} />
          </div>
        </div>

        <Card className="border-border bg-card shadow-xl overflow-hidden">
          <AnimatePresence mode="wait">
            
            {/* STEP 1: Student Details */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                <CardHeader>
                  <CardTitle className="text-xl">Step 1 — Student Details</CardTitle>
                  <CardDescription>
                    Enter your student information to request a Gmail verification code.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSendOtp} className="space-y-5">
                    <div>
                      <Label htmlFor="name" className="mb-2 block">Full Name</Label>
                      <Input
                        id="name"
                        placeholder="e.g. Ravikumar S"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        disabled={isSubmitting}
                      />
                    </div>

                    <div>
                      <Label htmlFor="usn" className="mb-2 block">University Seat Number (USN)</Label>
                      <Input
                        id="usn"
                        placeholder="e.g. 2VX25CS065"
                        value={usn}
                        onChange={(e) => setUsn(e.target.value.toUpperCase())}
                        required
                        disabled={isSubmitting}
                      />
                    </div>

                    <div>
                      <Label htmlFor="email" className="mb-2 block">Gmail Address</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="yourname@gmail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value.toLowerCase())}
                        required
                        disabled={isSubmitting}
                      />
                      <p className="mt-1 text-xs text-muted-foreground">
                        We will send a 6-digit verification code to this address.
                      </p>
                    </div>

                    {step1Error && (
                      <p className="text-sm font-medium text-rose-400 bg-rose-500/10 border border-rose-500/20 p-3 rounded-lg">
                        {step1Error}
                      </p>
                    )}

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full bg-teal hover:bg-teal/90 text-black font-semibold shadow-sm"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sending Code...
                        </>
                      ) : (
                        <>
                          <Mail className="mr-2 h-4 w-4" />
                          Verify Gmail
                        </>
                      )}
                    </Button>

                    <div className="text-center pt-2">
                      <p className="text-xs text-muted-foreground">
                        Already have an account?{" "}
                        <button
                          type="button"
                          onClick={() => navigate("/student/login")}
                          className="font-medium text-teal hover:underline"
                        >
                          Log in here
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
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-teal" />
                    Verify Your Email
                  </CardTitle>
                  <CardDescription>
                    We sent a 6-digit verification code to <strong className="text-foreground">{email}</strong>.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleVerifyOtp} className="space-y-6">
                    
                    {/* 6 OTP Inputs */}
                    <div className="flex justify-center gap-2 sm:gap-3 py-2">
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
                          className="h-12 w-11 sm:h-14 sm:w-12 text-center text-xl sm:text-2xl font-bold font-mono rounded-xl border border-border bg-muted text-foreground focus:outline-none focus:ring-2 focus:ring-teal focus:border-teal transition-all"
                        />
                      ))}
                    </div>

                    {/* Timer and Resend Controls */}
                    <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground gap-2 pt-1 border-t border-border">
                      <div className="flex items-center gap-1.5">
                        <span className={`inline-block h-2 w-2 rounded-full ${otpTimer > 60 ? "bg-emerald-400" : "bg-rose-400 animate-pulse"}`} />
                        <span>Code expires in: <strong className="font-mono text-foreground">{formatTime(otpTimer)}</strong></span>
                      </div>

                      <button
                        type="button"
                        onClick={handleResendCode}
                        disabled={resendCooldown > 0 || isSubmitting}
                        className={`flex items-center gap-1 font-medium transition-colors ${
                          resendCooldown > 0 ? "text-muted-foreground cursor-not-allowed opacity-60" : "text-teal hover:underline cursor-pointer"
                        }`}
                      >
                        <RotateCcw className="h-3 w-3" />
                        {resendCooldown > 0 ? `Resend code (${resendCooldown}s)` : "Resend code"}
                      </button>
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full bg-teal hover:bg-teal/90 text-black font-semibold shadow-sm"
                      disabled={isSubmitting || otp.join("").length !== 6 || otpTimer <= 0}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        "Verify OTP"
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
                        className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 transition-colors"
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
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Lock className="h-5 w-5 text-teal" />
                    Set Account Password
                  </CardTitle>
                  <CardDescription>
                    Your email is verified. Choose a secure password to complete your account setup.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleFinalSubmit} className="space-y-5">
                    <div>
                      <Label htmlFor="password" className="mb-2 block">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="At least 8 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="new-password"
                        required
                        disabled={isSubmitting}
                      />
                    </div>

                    <div>
                      <Label htmlFor="confirmPassword" className="mb-2 block">Confirm Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Confirm your password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        autoComplete="new-password"
                        required
                        disabled={isSubmitting}
                      />
                    </div>

                    {passwordError && (
                      <p className="text-sm font-medium text-rose-400 bg-rose-500/10 border border-rose-500/20 p-3 rounded-lg">
                        {passwordError}
                      </p>
                    )}

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full bg-teal hover:bg-teal/90 text-black font-semibold shadow-sm"
                      disabled={isSubmitting || !password || !confirmPassword}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating Account...
                        </>
                      ) : (
                        "Create Account"
                      )}
                    </Button>
                  </form>
                </CardContent>
              </motion.div>
            )}

          </AnimatePresence>
        </Card>
      </motion.div>
    </div>
  );
}
