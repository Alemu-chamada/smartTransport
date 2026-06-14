import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { Card } from "../../../shared/ui/Card";
import { Button } from "../../../shared/ui/Button";
import { AuthLayout } from "../../../routes/AuthLayout";
import { authApi } from "../services";
import { useAuth } from "../../../providers/AuthProvider";

export function OTP() {
  const navigate = useNavigate();
  const { login, tempAuthData } = useAuth();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!tempAuthData) {
      navigate("/signin");
    }
  }, [tempAuthData, navigate]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value[0];
    }

    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = [...otp];
    pastedData.split("").forEach((char, index) => {
      if (index < 6) newOtp[index] = char;
    });
    setOtp(newOtp);

    const nextEmptyIndex = newOtp.findIndex((digit) => !digit);
    const focusIndex = nextEmptyIndex === -1 ? 5 : nextEmptyIndex;
    inputRefs.current[focusIndex]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.some((digit) => !digit) || !tempAuthData) return;

    setLoading(true);
    try {
      const otpCode = otp.join("");
      const result = await authApi.verifyOtp({
        email: tempAuthData.email,
        phone: tempAuthData.phone,
        otp: otpCode,
        purpose: tempAuthData.purpose,
      });
      login(result);
      navigate("/dashboard");
    } catch (error: any) {
      console.error('OTP verification error:', error);
      const errorMessage = error.message || error.data?.message || "Invalid or expired OTP";
      let displayMessage = errorMessage;
      
      if (error.status === 401) {
        displayMessage = "Invalid or expired OTP. Please try again or request a new code.";
      } else if (error.code === 'INVALID_OTP') {
        displayMessage = "Invalid code. Please check the OTP and try again.";
      } else if (error.code === 'OTP_EXPIRED') {
        displayMessage = "OTP expired. Please request a new code.";
      }
      
      setErrors({ general: displayMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend || !tempAuthData) return;
    try {
      if (tempAuthData.purpose === "registration") {
        throw new Error("Resend not implemented for registration yet.");
      } else if (tempAuthData.purpose === "login") {
        throw new Error("Resend not implemented for login yet.");
      }
      // TODO: Implement resend
    } catch (error: any) {
      console.error('Resend OTP error:', error);
      const displayMessage = error.message || error.data?.message || "Failed to resend code. Please try again.";
      setErrors({ general: displayMessage });
    }
  };

  const isComplete = otp.every((digit) => digit !== "");
  const contact = tempAuthData?.email || tempAuthData?.phone || "your email/phone";

  return (
    <AuthLayout>
      <Card className="p-8">
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.6 }}
            className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-sm mb-4"
          >
            <span className="text-primary-foreground font-bold text-2xl">T</span>
          </motion.div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Verify Your Account</h1>
          <p className="text-muted-foreground">
            We've sent a 6-digit code to
          </p>
          <p className="text-sm font-medium text-foreground mt-1">
            {contact}
          </p>
        </div>

        {errors.general && (
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex gap-3 justify-center">
            {otp.map((digit, index) => (
              <motion.input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                whileFocus={{ scale: 1.05 }}
                className="w-12 h-14 text-center text-xl font-bold rounded-xl bg-input-background border-2 border-border focus:border-primary focus:outline-none transition-all"
              />
            ))}
          </div>

          <Button
            type="submit"
            className="w-full"
            loading={loading}
            disabled={!isComplete}
          >
            Verify Code
          </Button>

          <div className="text-center">
            {canResend ? (
              <button
                type="button"
                onClick={handleResend}
                className="text-sm text-primary font-medium hover:underline"
              >
                Resend Code
              </button>
            ) : (
              <p className="text-sm text-muted-foreground">
                Resend code in{" "}
                <span className="font-medium text-foreground">{countdown}s</span>
              </p>
            )}
          </div>
        </form>
      </Card>
    </AuthLayout>
  );
}
