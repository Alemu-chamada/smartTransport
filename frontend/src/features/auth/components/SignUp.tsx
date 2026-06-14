import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { motion } from "motion/react";
import { Card } from "../../../shared/ui/Card";
import { Input } from "../../../shared/ui/Input";
import { Button } from "../../../shared/ui/Button";
import { AuthLayout } from "../../../routes/AuthLayout";
import { authApi } from "../services";
import { useAuth } from "../../../providers/AuthProvider";

export function SignUp() {
  const navigate = useNavigate();
  const { setTempAuthData } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    console.log('validating form with data:', formData);

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }
    if (!formData.email.trim() && !formData.phone.trim()) {
      newErrors.email = "Either email or phone number is required";
      newErrors.phone = "Either email or phone number is required";
    }
    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    }
    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = "Confirm Password is required";
    }
    if (formData.password.trim() !== formData.confirmPassword.trim()) {
      newErrors.confirmPassword = "Passwords do not match";
      newErrors.password = "Passwords do not match";
    }

    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;
    console.log('form isValid:', isValid, 'errors:', newErrors);
    return isValid;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    console.log('handleSubmit CALLED!');
    e.preventDefault();
    if (!validateForm()) {
      console.log('validateForm FAILED, not submitting');
      return;
    }

    console.log('validateForm PASSED, proceeding to register');
    setLoading(true);
    try {
      const first_name = formData.firstName.trim();
      const last_name = formData.lastName.trim();
      const email = formData.email.trim() || undefined;
      const phone = formData.phone.trim() || undefined;
      const password = formData.password.trim();

      console.log('calling register with:', { first_name, last_name, email, phone });
      const res = await authApi.register({ first_name, last_name, email, phone, password });
      console.log('register returned:', res);

      setTempAuthData({ email, phone, purpose: "registration" });
      navigate("/otp");
    } catch (error: any) {
      console.error('ERROR in handleSubmit:', error);
      const errorMessage = error.message || error.data?.message || "An error occurred. Please try again.";
      
      let displayMessage = errorMessage;
      
      if (error.code === 'DUPLICATE_EMAIL') {
        displayMessage = "That email is already registered. Please sign in instead.";
        setErrors({ general: displayMessage, email: "Email already registered" });
        return;
      }
      
      if (error.code === 'DUPLICATE_PHONE') {
        displayMessage = "That phone number is already registered. Please sign in instead.";
        setErrors({ general: displayMessage, phone: "Phone already registered" });
        return;
      }
      
      if (error.status === 400 || error.status === 422) {
        displayMessage = error.data?.message || "Please check all required fields are filled correctly.";
      }

      setErrors({ general: displayMessage });
    } finally {
      setLoading(false);
    }
  };

  console.log('rendering, errors:', errors);

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
          <h1 className="text-3xl font-bold text-foreground mb-2">Create Account</h1>
          <p className="text-muted-foreground">Join TMS and start managing your transportation</p>
        </div>

        {errors.general && (
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="First Name"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              error={errors.firstName}
              placeholder="First name"
            />
            <Input
              label="Last Name"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              error={errors.lastName}
              placeholder="Last name"
            />
          </div>

          <Input
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            placeholder="you@example.com"
          />

          <Input
            label="Phone Number"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            error={errors.phone}
            placeholder="+1 (555) 000-0000"
          />

          <Input
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            placeholder="Enter a password"
          />

          <Input
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
            placeholder="Confirm your password"
          />

          <Button
            type="submit"
            className="w-full mt-6"
            loading={loading}
          >
            Create Account
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              to="/signin"
              className="text-primary font-medium hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </Card>
    </AuthLayout>
  );
}
