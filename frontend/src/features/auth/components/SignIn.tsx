import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { motion } from "motion/react";
import { Card } from "../../../shared/ui/Card";
import { Input } from "../../../shared/ui/Input";
import { Button } from "../../../shared/ui/Button";
import { AuthLayout } from "../../../routes/AuthLayout";
import { authApi } from "../services";
import { useAuth } from "../../../providers/AuthProvider";

export function SignIn() {
  const navigate = useNavigate();
  const { setTempAuthData } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    emailOrPhone: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    if (!formData.emailOrPhone.trim()) {
      newErrors.emailOrPhone = "Email or phone is required";
    }
    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const isEmail = formData.emailOrPhone.includes("@");
      const email = isEmail ? formData.emailOrPhone.trim() : undefined;
      const phone = !isEmail ? formData.emailOrPhone.trim() : undefined;
      const password = formData.password.trim();

      await authApi.login({ email, phone, password });
      setTempAuthData({ email, phone, purpose: "login" });
      navigate("/otp");
    } catch (error: any) {
      console.error('SignIn error:', error);
      const errorMessage = error.message || error.data?.message || "An error occurred. Please try again.";
      
      let displayMessage = errorMessage;
      
      if (error.status === 401) {
        displayMessage = "Invalid email/phone or password.";
      }
      
      setErrors({ general: displayMessage });
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = formData.emailOrPhone && formData.password;

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
          <h1 className="text-3xl font-bold text-foreground mb-2">Welcome Back</h1>
          <p className="text-muted-foreground">Sign in to your TMS account</p>
        </div>

        {errors.general && (
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email or Phone"
            name="emailOrPhone"
            value={formData.emailOrPhone}
            onChange={handleChange}
            error={errors.emailOrPhone}
            placeholder="you@example.com or your phone number"
          />

          <Input
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            placeholder="Enter your password"
          />

          <Button
            type="submit"
            className="w-full mt-6"
            loading={loading}
            disabled={!isFormValid}
          >
            Send Verification Code
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-primary font-medium hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>
      </Card>
    </AuthLayout>
  );
}
