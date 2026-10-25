"use client";

import { useActionState, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { requestPasswordResetAction, verifyOtpOnlyAction, resetPasswordAction } from "@/lib/actions/auth.actions";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";

export function ForgotPasswordForm() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [reqState, reqAction, reqPending] = useActionState(requestPasswordResetAction, {} as any);
  const [verifyState, verifyAction, verifyPending] = useActionState(verifyOtpOnlyAction, {} as any);
  const [resetState, resetAction, resetPending] = useActionState(resetPasswordAction, {} as any);

  // Step 1 to Step 2
  useEffect(() => {
    if (reqState?.success && step === 1) {
      setEmail(reqState.email);
      setStep(2);
    }
  }, [reqState, step]);

  // Step 2 to Step 3
  useEffect(() => {
    if (verifyState?.success && step === 2) {
      setOtpCode(verifyState.code);
      setStep(3);
    }
  }, [verifyState, step]);

  // Step 3 to Login
  useEffect(() => {
    if (resetState?.success) {
      setTimeout(() => router.push("/admin/login"), 3000);
    }
  }, [resetState, router]);

  return (
    <div className="w-full">
      {step > 1 && (
        <button onClick={() => setStep(1)} className="inline-flex items-center gap-2 text-sm font-semibold text-mist hover:text-ink mb-6 transition-colors">
          <ArrowLeft className="size-4" /> Back to start
        </button>
      )}

      <h1 className="font-display text-4xl font-bold uppercase tracking-wide text-ink mb-2">
        {step === 1 ? "Reset Password" : step === 2 ? "Verify OTP" : "New Password"}
      </h1>
      <p className="text-sm text-mist mb-8">
        {step === 1 && "Enter your email address and we'll send you an OTP."}
        {step === 2 && `Enter the 6-digit code sent to ${email}.`}
        {step === 3 && "Create a new secure password for your account."}
      </p>

      {/* STEP 1: REQUEST OTP */}
      {step === 1 && (
        <form action={reqAction} className="space-y-5">
          {reqState?.error && <div className="bg-danger/10 text-danger p-3 rounded-lg text-sm font-semibold">{reqState.error}</div>}
          <div>
            <label htmlFor="email" className="label">Admin Email</label>
            <input id="email" name="email" type="email" required className="input" placeholder="admin@example.com" />
          </div>
          <button type="submit" disabled={reqPending} className="btn btn-primary w-full">
            {reqPending ? "Sending OTP..." : "Send OTP"}
          </button>
        </form>
      )}

      {/* STEP 2: VERIFY OTP */}
      {step === 2 && (
        <form action={verifyAction} className="space-y-5">
          {verifyState?.error && <div className="bg-danger/10 text-danger p-3 rounded-lg text-sm font-semibold">{verifyState.error}</div>}
          <input type="hidden" name="email" value={email} />
          <div>
            <label htmlFor="code" className="label">6-Digit OTP</label>
            <input id="code" name="code" type="text" maxLength={6} required className="input font-mono text-center tracking-[0.5em] text-lg" placeholder="000000" />
          </div>
          <button type="submit" disabled={verifyPending} className="btn btn-primary w-full">
            {verifyPending ? "Verifying..." : "Verify Code"}
          </button>
          <button type="button" onClick={() => setStep(1)} className="btn btn-outline-light w-full mt-2">
            Request a new code
          </button>
        </form>
      )}

      {/* STEP 3: RESET PASSWORD */}
      {step === 3 && (
        <form action={resetAction} className="space-y-5">
          {resetState?.error && <div className="bg-danger/10 text-danger p-3 rounded-lg text-sm font-semibold">{resetState.error}</div>}
          {resetState?.success && (
            <div className="bg-success/10 text-success p-4 rounded-lg text-sm font-semibold">
              {resetState.success} Redirecting to login...
            </div>
          )}
          <input type="hidden" name="email" value={email} />
          <input type="hidden" name="code" value={otpCode} />
          <div>
            <label htmlFor="password" className="label">New Password</label>
            <div className="relative">
              <input id="password" name="password" type={showPassword ? "text" : "password"} required minLength={12} className="input pr-12" placeholder="Min. 12 characters" />
              <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute inset-y-0 right-0 grid w-12 place-items-center text-mist hover:text-ink">
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>
          <button type="submit" disabled={resetPending || resetState?.success} className="btn btn-primary w-full">
            {resetPending ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      )}
    </div>
  );
}