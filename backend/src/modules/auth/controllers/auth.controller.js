const asyncHandler = require("../../../shared/utils/asyncHandler.js");
const logger = require("../../../shared/utils/logger.js");
const { success } = require("../../../shared/utils/response.js");
const authService = require("../services/auth.service.js");
const profileService = require("../../profile/services/profile.service.js");
const ApiError = require("../../../shared/utils/apiError.js");
const env = require("../../../config/env.js");

const register = asyncHandler(async (req, res) => {
  logger.info('[AUTH CONTROLLER] register request body:', req.body);
  const result = await authService.register(req.body);
  logger.info('[AUTH CONTROLLER] register result:', result);

  return success(res, {
    message: "Registration successful. OTP sent.",
    data: result
  });
});

const login = asyncHandler(async (req, res) => {
  logger.info('[AUTH CONTROLLER] login request body:', req.body);
  const result = await authService.login(req.body);
  logger.info('[AUTH CONTROLLER] login result:', result);

  return success(res, {
    message: "Login credentials verified. OTP sent.",
    data: result
  });
});

const verifyOtp = asyncHandler(async (req, res) => {
  const { 
    otp, 
    purpose, 
    email, 
    phone, 
    new_email, 
    new_phone, 
    new_password 
  } = req.body;

  // Basic validation first
  const errors = [];

  if (!otp) {
    errors.push({ field: "otp", message: "OTP is required" });
  }
  if (!purpose) {
    errors.push({ field: "purpose", message: "Purpose is required" });
  }

  // Validate purpose-specific validation
  if (purpose === "login" || purpose === "registration") {
    if (!email && !phone) {
      errors.push({ field: "email/phone", message: "Email or phone is required" });
    }
  } else if (purpose === "change_email") {
    if (!new_email) {
      errors.push({ field: "new_email", message: "New email is required" });
    }
  } else if (purpose === "change_phone") {
    if (!new_phone) {
      errors.push({ field: "new_phone", message: "New phone is required" });
    }
  } else if (purpose === "change_password") {
    if (!new_password) {
      errors.push({ field: "new_password", message: "New password is required" });
    }
  }

  if (errors.length > 0) {
    throw new ApiError(400, "Validation failed", "VALIDATION_ERROR", errors);
  }

  const result = await authService.verifyOtp({
    ...req.body,
    user: req.user
  });

  return success(res, {
    message: "OTP verified successfully",
    data: result
  });
});

const sendChangeEmailOtp = asyncHandler(async (req, res) => {
  logger.info('[AUTH CONTROLLER] sendChangeEmailOtp request body:', req.body);
  const result = await authService.sendChangeEmailOtp({
    user: req.user,
    new_email: req.body.new_email
  });
  logger.info('[AUTH CONTROLLER] sendChangeEmailOtp result:', result);

  return success(res, {
    message: "OTP sent to new email address",
    data: result
  });
});

const sendChangePhoneOtp = asyncHandler(async (req, res) => {
  logger.info('[AUTH CONTROLLER] sendChangePhoneOtp request body:', req.body);
  const result = await authService.sendChangePhoneOtp({
    user: req.user,
    new_phone: req.body.new_phone
  });
  logger.info('[AUTH CONTROLLER] sendChangePhoneOtp result:', result);

  return success(res, {
    message: "OTP sent to new phone number",
    data: result
  });
});

const sendChangePasswordOtp = asyncHandler(async (req, res) => {
  logger.info('[AUTH CONTROLLER] sendChangePasswordOtp request body:', req.body);
  const result = await authService.sendChangePasswordOtp({
    user: req.user,
    old_password: req.body.old_password,
    new_password: req.body.new_password
  });
  logger.info('[AUTH CONTROLLER] sendChangePasswordOtp result:', result);

  return success(res, {
    message: "OTP sent to your email or phone",
    data: result
  });
});

const logout = asyncHandler(async (req, res) => {
  const result = await authService.logout(req.user.id);

  return success(res, {
    message: result.message
  });
});

const me = asyncHandler(async (req, res) => {
  const profile = await profileService.getByUserIdAndRole(req.user.id, req.user.role) || 
    await profileService.getOrCreateProfile(req.user.id, req.user.role);
  const profileCompletionRequired = req.user.role === "driver" && 
    profile.profile_status !== "COMPLETE" && 
    profile.profile_status !== "VERIFIED";

  return success(res, {
    message: "Current user fetched successfully",
    data: {
      user: req.user,
      profile,
      profile_completion_required: profileCompletionRequired,
      incomplete_role: profileCompletionRequired ? req.user.role : null,
      rejection_reason: profile.rejection_reason || null
    }
  });
});

const resendOtp = asyncHandler(async (req, res) => {
  logger.info('[AUTH CONTROLLER] resendOtp request body:', req.body);
  const result = await authService.resendOtp(req.body);
  logger.info('[AUTH CONTROLLER] resendOtp result:', result);

  return success(res, {
    message: "OTP resent successfully",
    data: result
  });
});

const forgotPassword = asyncHandler(async (req, res) => {
  const result = await authService.forgotPassword({ email: req.body.email });
  return success(res, { message: "If that email exists, a reset code was sent.", data: result });
});

const resetPassword = asyncHandler(async (req, res) => {
  const result = await authService.resetPassword({
    email: req.body.email,
    otp: req.body.otp,
    new_password: req.body.new_password,
  });
  return success(res, { message: "Password reset successfully.", data: result });
});

module.exports = {
  register,
  login,
  verifyOtp,
  sendChangeEmailOtp,
  sendChangePhoneOtp,
  sendChangePasswordOtp,
  logout,
  me,
  resendOtp,
  forgotPassword,
  resetPassword,
};
