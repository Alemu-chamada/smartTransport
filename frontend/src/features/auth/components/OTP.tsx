import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { ShieldCheck, AlertCircle, CheckCircle2, RefreshCw, ArrowLeft } from "lucide-react";
import { AuthLayout } from "../../../routes/AuthLayout";
import { authApi } from "../services";
import { useAuth } from "../../../providers/AuthProvider";

export function OTP() {
  const navigate = useNavigate();
  const { login, tempAuthData } = useAuth();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [resendSuccess, setResendSuccess] = useState(false);
  const [verified, setVerified] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!tempAuthData) navigate("/signin");
  }, [tempAuthData, navigate]);

  useEffect(() => { inputRefs.current[0]?.focus(); }, []);

  useEffect(() => {
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
      return () => clearTimeout(t);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const v = value.slice(-1);
    const next = [...otp];
    next[index] = v;
    setOtp(next);
    setErrors({});
    setResendSuccess(false);
    if (v && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (otp[index]) {
        const next = [...otp]; next[index] = ""; setOtp(next);
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
    if (e.key === "ArrowLeft" && index > 0) inputRefs.current[index - 1]?.focus();
    if (e.key === "ArrowRight" && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const next = [...otp];
    pasted.split("").forEach((c, i) => { if (i < 6) next[i] = c; });
    setOtp(next);
    const focus = Math.min(pasted.length, 5);
    inputRefs.current[focus]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.some((d) => !d) || !tempAuthData) return;
    setLoading(true);
    setErrors({});
    try {
      const result = await authApi.verifyOtp({
        email: tempAuthData.email,
        phone: tempAuthData.phone,
        otp: otp.join(""),
        purpose: tempAuthData.purpose,
      });
      setVerified(true);
      setTimeout(() => {
        login(result);
        navigate("/dashboard");
      }, 800);
    } catch (error: any) {
      const msg =
        error.status === 401 || error.code === "INVALID_OTP"
          ? "Incorrect code. Please check and try again."
          : error.data?.message || error.message || "Verification failed. Try again.";
      setErrors({ general: msg });
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend || !tempAuthData || resendLoading) return;
    setResendLoading(true);
    setErrors({});
    setResendSuccess(false);
    try {
      await authApi.resendOtp({
        email: tempAuthData.email,
        phone: tempAuthData.phone,
        purpose: tempAuthData.purpose,
      });
      setCountdown(60);
      setCanResend(false);
      setOtp(["", "", "", "", "", ""]);
      setResendSuccess(true);
      inputRefs.current[0]?.focus();
    } catch (error: any) {
      setErrors({ general: error.data?.message || error.message || "Failed to resend. Try again." });
    } finally {
      setResendLoading(false);
    }
  };

  const isComplete = otp.every((d) => d !== "");
  const contact = tempAuthData?.email || tempAuthData?.phone || "your contact";
  const maskedContact = contact.includes("@")
    ? contact.replace(/^(.{2})(.*)(@.*)$/, (_, a, b, c) => a + "*".repeat(Math.max(0, b.length - 2)) + b.slice(-2) + c)
    : contact.replace(/(\d{3})\d+(\d{3})/, "$1****$2");

  return (
    <AuthLayout>
      <div className="bg-card rounded-3xl shadow-xl border border-border p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.6 }}
            className={`inline-flex h-20 w-20 items-center justify-center rounded-3xl mb-5 shadow-lg transition-colors duration-500 ${
              verified ? "bg-green-500" : "bg-primary"
            }`}
          >
            <AnimatePresence mode="wait">
              {verified ? (
                <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                  <CheckCircle2 className="h-10 w-10 text-white" />
                </motion.div>
              ) : (
                <motion.div key="shield" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                  <ShieldCheck className="h-10 w-10 text-white" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          <h1 className="text-2xl font-bold text-foreground mb-2">
            {verified ? "Verified!" : "Check your inbox"}
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {verified
              ? "Identity confirmed. Redirecting you now…"
              : <>We sent a 6-digit code to<br /><span className="font-semibold text-foreground">{maskedContact}</span></>
            }
          </p>
        </div>

        {/* Alerts */}
        <AnimatePresence>
          {errors.general && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mb-5 flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-2xl text-destructive text-sm"
            >
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{errors.general}</span>
            </motion.div>
          )}
          {resendSuccess && (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mb-5 flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-2xl text-green-700 text-sm"
            >
              <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
              <span>New code sent! Check your inbox and spam folder.</span>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit}>
          {/* OTP Inputs */}
          <div className="flex gap-2.5 justify-center mb-8">
            {otp.map((digit, i) => (
              <motion.input
                key={i}
                ref={(el) => (inputRefs.current[i] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                onPaste={handlePaste}
                disabled={loading || verified}
                whileFocus={{ scale: 1.08 }}
                className={`w-12 h-14 text-center text-xl font-bold rounded-2xl border-2 bg-background text-foreground focus:outline-none transition-all disabled:opacity-60 ${
                  digit
                    ? "border-primary bg-primary/5 text-primary"
                    : errors.general
                    ? "border-destructive/50"
                    : "border-border hover:border-primary/50 focus:border-primary"
                }`}
              />
            ))}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={!isComplete || loading || verified}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                Verifying…
              </span>
            ) : verified ? (
              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" /> Verified!
              </span>
            ) : (
              "Verify Code"
            )}
          </button>
        </form>

        {/* Resend */}
        <div className="mt-6 text-center">
          {canResend ? (
            <button
              type="button"
              onClick={handleResend}
              disabled={resendLoading}
              className="inline-flex items-center gap-2 text-sm text-primary font-medium hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${resendLoading ? "animate-spin" : ""}`} />
              {resendLoading ? "Sending new code…" : "Resend code"}
            </button>
          ) : (
            <p className="text-sm text-muted-foreground">
              Resend code in{" "}
              <span className="font-semibold text-foreground tabular-nums">
                {String(Math.floor(countdown / 60)).padStart(2, "0")}:{String(countdown % 60).padStart(2, "0")}
              </span>
            </p>
          )}
        </div>

        {/* Back link */}
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => navigate("/signin")}
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3 w-3" />
            Back to sign in
          </button>
        </div>
      </div>
    </AuthLayout>
  );
}
