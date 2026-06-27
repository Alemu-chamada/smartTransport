import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { motion } from "motion/react";
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from "lucide-react";
import { AuthLayout } from "../../../routes/AuthLayout";
import { authApi } from "../services";
import { useAuth } from "../../../providers/AuthProvider";

export function SignIn() {
  const navigate = useNavigate();
  const { setTempAuthData } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ emailOrPhone: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name] || errors.general) {
      setErrors((prev) => ({ ...prev, [name]: "", general: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!formData.emailOrPhone.trim()) newErrors.emailOrPhone = "Email or phone is required";
    if (!formData.password.trim()) newErrors.password = "Password is required";
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

    setLoading(true);
    try {
      const isEmail = formData.emailOrPhone.includes("@");
      const email = isEmail ? formData.emailOrPhone.trim() : undefined;
      const phone = !isEmail ? formData.emailOrPhone.trim() : undefined;
      await authApi.login({ email, phone, password: formData.password.trim() });
      setTempAuthData({ email, phone, purpose: "login" });
      navigate("/otp");
    } catch (error: any) {
      const msg =
        error.status === 401
          ? "Invalid email/phone or password."
          : error.data?.message || error.message || "Something went wrong. Please try again.";
      setErrors({ general: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div>
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black" style={{ color: "#001621" }}>Welcome back</h1>
          <p className="mt-1 text-sm" style={{ color: "#6b7280" }}>Sign in to continue your journey</p>
        </div>

        {/* Error banner */}
        {errors.general && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex items-start gap-3 p-4 rounded-2xl text-sm font-semibold"
            style={{ backgroundColor: "rgba(253,24,67,0.08)", border: "1px solid rgba(253,24,67,0.2)", color: "#FD1843" }}>
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{errors.general}</span>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email / Phone */}
          <div>
            <label className="block text-sm font-bold mb-2" style={{ color: "#001621" }}>
              Email or Phone
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none" style={{ color: "#9ca3af" }} />
              <input
                name="emailOrPhone" value={formData.emailOrPhone} onChange={handleChange}
                placeholder="you@example.com or phone number" autoComplete="username"
                className={`w-full pl-11 pr-4 py-3 rounded-xl border bg-white text-sm transition-all
                  focus:outline-none placeholder:text-gray-400 text-[#001621]
                  ${errors.emailOrPhone ? "border-[#FD1843]" : "border-gray-200 hover:border-gray-300 focus:border-[#21F1A8] focus:ring-2 focus:ring-[#21F1A8]/20"}`}
              />
            </div>
            {errors.emailOrPhone && <p className="mt-1.5 text-xs font-semibold text-[#FD1843]">{errors.emailOrPhone}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-bold mb-2" style={{ color: "#001621" }}>
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none" style={{ color: "#9ca3af" }} />
              <input
                name="password" type={showPassword ? "text" : "password"} value={formData.password}
                onChange={handleChange} placeholder="Enter your password" autoComplete="current-password"
                className={`w-full pl-11 pr-12 py-3 rounded-xl border bg-white text-sm transition-all
                  focus:outline-none placeholder:text-gray-400 text-[#001621]
                  ${errors.password ? "border-[#FD1843]" : "border-gray-200 hover:border-gray-300 focus:border-[#21F1A8] focus:ring-2 focus:ring-[#21F1A8]/20"}`}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors hover:text-[#001621]"
                style={{ color: "#9ca3af" }}>
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && <p className="mt-1.5 text-xs font-semibold text-[#FD1843]">{errors.password}</p>}
          </div>

          {/* Submit */}
          <button type="submit" disabled={loading || !formData.emailOrPhone || !formData.password}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: "#FF4103", boxShadow: "0 4px 16px rgba(255,65,3,0.35)" }}>
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                Sending code…
              </span>
            ) : (
              <>Send Verification Code<ArrowRight className="h-4 w-4" /></>
            )}
          </button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <div className="flex-1 h-px" style={{ backgroundColor: "#e5e7eb" }} />
          <span className="text-xs font-medium" style={{ color: "#9ca3af" }}>New here?</span>
          <div className="flex-1 h-px" style={{ backgroundColor: "#e5e7eb" }} />
        </div>

        <Link to="/signup"
          className="w-full flex items-center justify-center py-3 px-6 rounded-xl border-2 font-bold text-sm transition-colors hover:bg-gray-50"
          style={{ borderColor: "#e5e7eb", color: "#001621" }}>
          Create an account
        </Link>
      </div>
    </AuthLayout>
  );
}
