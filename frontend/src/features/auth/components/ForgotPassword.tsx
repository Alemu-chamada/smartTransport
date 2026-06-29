import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Mail, ArrowRight, AlertCircle, CheckCircle2, Lock, Eye, EyeOff } from "lucide-react";
import { AuthLayout } from "../../../routes/AuthLayout";
import { authApi } from "../services";

type Step = "email" | "reset";

export function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  /* ── Step 1: send OTP ── */
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { setErrors({ email: "Email is required." }); return; }
    if (!/\S+@\S+\.\S+/.test(email.trim())) { setErrors({ email: "Enter a valid email." }); return; }
    setLoading(true);
    setErrors({});
    try {
      await authApi.forgotPassword({ email: email.trim() });
      setStep("reset");
    } catch {
      setErrors({ general: "Failed to send OTP. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  /* ── Step 2: verify OTP + set new password ── */
  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!otp.trim()) errs.otp = "OTP is required.";
    if (!newPassword.trim()) errs.newPassword = "New password is required.";
    if (newPassword.length < 8) errs.newPassword = "Password must be at least 8 characters.";
    if (newPassword !== confirmPassword) errs.confirmPassword = "Passwords do not match.";
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    setErrors({});
    try {
      await authApi.resetPassword({ email, otp, new_password: newPassword });
      setSuccess(true);
      setTimeout(() => navigate("/signin"), 2500);
    } catch (error: any) {
      const msg = error.data?.message || error.message || "Reset failed. OTP may be invalid or expired.";
      setErrors({ general: msg });
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field: string) =>
    `w-full pl-11 pr-4 py-3 rounded-xl border bg-white text-sm transition-all focus:outline-none placeholder:text-gray-400 text-[#001621] ${
      errors[field]
        ? "border-[#FD1843] focus:ring-2 focus:ring-[#FD1843]/20"
        : "border-gray-200 hover:border-gray-300 focus:border-[#21F1A8] focus:ring-2 focus:ring-[#21F1A8]/20"
    }`;

  if (success) {
    return (
      <AuthLayout>
        <div className="text-center py-4">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", duration: 0.6 }}>
            <div className="h-20 w-20 rounded-3xl flex items-center justify-center mx-auto mb-5"
              style={{ backgroundColor: "#2BEE34" }}>
              <CheckCircle2 className="h-10 w-10 text-white" />
            </div>
          </motion.div>
          <h2 className="text-2xl font-black mb-2" style={{ color: "#001621" }}>Password Reset!</h2>
          <p className="text-sm" style={{ color: "#6b7280" }}>Redirecting you to sign in…</p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div>
        <div className="mb-7">
          <h1 className="text-2xl font-black" style={{ color: "#001621" }}>
            {step === "email" ? "Forgot Password" : "Reset Password"}
          </h1>
          <p className="mt-1 text-sm" style={{ color: "#6b7280" }}>
            {step === "email"
              ? "Enter your registered email and we'll send a reset code."
              : `Enter the 6-digit code sent to ${email} and choose a new password.`}
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-6">
          {(["email", "reset"] as Step[]).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                step === s ? "text-white" : i < (step === "reset" ? 1 : 0) ? "text-white" : "text-gray-400"
              }`} style={{ backgroundColor: step === s ? "#FF4103" : i < (step === "reset" ? 1 : 0) ? "#21F1A8" : "#e5e7eb" }}>
                {i < (step === "reset" ? 1 : 0) ? "✓" : i + 1}
              </div>
              {i < 1 && <div className="flex-1 h-px w-8" style={{ backgroundColor: step === "reset" ? "#21F1A8" : "#e5e7eb" }} />}
            </div>
          ))}
        </div>

        {/* Error banner */}
        <AnimatePresence>
          {errors.general && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="mb-5 flex items-start gap-3 p-4 rounded-2xl text-sm font-semibold"
              style={{ backgroundColor: "rgba(253,24,67,0.08)", border: "1px solid rgba(253,24,67,0.2)", color: "#FD1843" }}>
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{errors.general}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step 1 */}
        {step === "email" && (
          <form onSubmit={handleSendOtp} className="space-y-5">
            <div>
              <label className="block text-sm font-bold mb-2" style={{ color: "#001621" }}>Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none" style={{ color: "#9ca3af" }} />
                <input value={email} onChange={e => { setEmail(e.target.value); setErrors({}); }}
                  placeholder="you@example.com" type="email" autoComplete="email"
                  className={inputClass("email")} />
              </div>
              {errors.email && <p className="mt-1.5 text-xs font-semibold" style={{ color: "#FD1843" }}>{errors.email}</p>}
            </div>
            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: "#FF4103", boxShadow: "0 4px 16px rgba(255,65,3,0.35)" }}>
              {loading
                ? <span className="flex items-center gap-2"><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>Sending…</span>
                : <><ArrowRight className="h-4 w-4" /> Send Reset Code</>}
            </button>
          </form>
        )}

        {/* Step 2 */}
        {step === "reset" && (
          <form onSubmit={handleReset} className="space-y-4">
            <div>
              <label className="block text-sm font-bold mb-2" style={{ color: "#001621" }}>6-Digit OTP</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none" style={{ color: "#9ca3af" }} />
                <input value={otp} onChange={e => { setOtp(e.target.value.replace(/\D/g, "").slice(0, 6)); setErrors({}); }}
                  placeholder="123456" maxLength={6} inputMode="numeric"
                  className={inputClass("otp")} />
              </div>
              {errors.otp && <p className="mt-1.5 text-xs font-semibold" style={{ color: "#FD1843" }}>{errors.otp}</p>}
            </div>
            <div>
              <label className="block text-sm font-bold mb-2" style={{ color: "#001621" }}>New Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none" style={{ color: "#9ca3af" }} />
                <input value={newPassword} onChange={e => { setNewPassword(e.target.value); setErrors({}); }}
                  type={showPw ? "text" : "password"} placeholder="Min. 8 characters"
                  className={`${inputClass("newPassword")} pr-12`} />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-4 top-1/2 -translate-y-1/2" style={{ color: "#9ca3af" }}>
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.newPassword && <p className="mt-1.5 text-xs font-semibold" style={{ color: "#FD1843" }}>{errors.newPassword}</p>}
            </div>
            <div>
              <label className="block text-sm font-bold mb-2" style={{ color: "#001621" }}>Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none" style={{ color: "#9ca3af" }} />
                <input value={confirmPassword} onChange={e => { setConfirmPassword(e.target.value); setErrors({}); }}
                  type={showConfirm ? "text" : "password"} placeholder="Repeat new password"
                  className={`${inputClass("confirmPassword")} pr-12`} />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-4 top-1/2 -translate-y-1/2" style={{ color: "#9ca3af" }}>
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="mt-1.5 text-xs font-semibold" style={{ color: "#FD1843" }}>{errors.confirmPassword}</p>}
            </div>
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={() => { setStep("email"); setErrors({}); }}
                className="flex-1 py-3 rounded-xl border-2 font-bold text-sm transition-colors hover:bg-gray-50"
                style={{ borderColor: "#e5e7eb", color: "#001621" }}>
                Back
              </button>
              <button type="submit" disabled={loading}
                className="flex-1 py-3 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: "#FF4103", boxShadow: "0 4px 16px rgba(255,65,3,0.35)" }}>
                {loading
                  ? <span className="flex items-center justify-center gap-2"><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>Resetting…</span>
                  : "Reset Password"}
              </button>
            </div>
            <button type="button" onClick={handleSendOtp} disabled={loading}
              className="w-full text-xs font-semibold transition-colors hover:underline"
              style={{ color: "#FF4103" }}>
              Resend code
            </button>
          </form>
        )}

        <div className="mt-6 text-center">
          <Link to="/signin" className="text-sm font-semibold hover:underline" style={{ color: "#001621" }}>
            ← Back to Sign In
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
