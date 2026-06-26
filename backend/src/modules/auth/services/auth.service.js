const jwt = require("jsonwebtoken");
const userService = require("../../user/services/user.service.js");
const otpService = require("./otp.service.js");
const auditService = require("../../audit/services/audit.service.js");
const profileService = require("../../profile/services/profile.service.js");
const db = require("../../../infrastructure/database/db.js");
const env = require("../../../config/env.js");
const ApiError = require("../../../shared/utils/apiError.js");
const logger = require("../../../shared/utils/logger.js");

const generateAuthTokens = async (user) => {
  try {
    const accessToken = jwt.sign(
      { sub: user.id, role: user.role },
      env.jwtSecret,
      { expiresIn: env.jwtExpiresIn }
    );

    const refreshToken = jwt.sign(
      { sub: user.id },
      env.jwtRefreshSecret,
      { expiresIn: env.jwtRefreshExpiresIn }
    );

    return {
      accessToken,
      refreshToken,
      expiresAt: new Date(Date.now() + 86400000),
      user,
    };
  } catch (tokenError) {
    logger.error("Error generating auth tokens", {
      error: tokenError.message,
    });
    throw tokenError;
  }
};

const register = async ({ first_name, last_name, email, phone, password }) => {
  logger.info("Registering new user", {
    hasEmail: !!email,
    hasPhone: !!phone,
  });

  if (!first_name || !last_name) {
    throw new ApiError(422, "First name and last name are required.", "VALIDATION_ERROR");
  }
  if (!email && !phone) {
    throw new ApiError(422, "Either email or phone is required.", "VALIDATION_ERROR");
  }
  if (!password) {
    throw new ApiError(422, "Password is required.", "VALIDATION_ERROR");
  }

  const newUser = await userService.createUser({ first_name, last_name, email, phone, password });
  const userId = newUser.id;
  logger.info("User created successfully", { userId });

  const result = await otpService.createOtp({
    email,
    phone,
    userId,
    purpose: "registration",
  });

  await auditService.log({
    actorId: userId,
    action: "OTP_SENT",
    entityType: "auth",
  });

  return { success: true, expiresAt: result.expiresAt, userId };
};

const login = async ({ email, phone, password }) => {
  logger.info("Login attempt", {
    hasEmail: !!email,
    hasPhone: !!phone,
  });

  if (!email && !phone) {
    throw new ApiError(422, "Either email or phone is required.", "VALIDATION_ERROR");
  }
  if (!password) {
    throw new ApiError(422, "Password is required.", "VALIDATION_ERROR");
  }

  const user = await userService.findByEmailOrPhone({ email, phone });
  if (!user) {
    throw new ApiError(401, "Invalid credentials.", "INVALID_CREDENTIALS");
  }

  if (!user.is_active) {
    throw new ApiError(403, "Account is not active. Please verify your account first.", "ACCOUNT_INACTIVE");
  }

  const isPasswordValid = await userService.verifyPassword(user.id, password);
  if (!isPasswordValid) {
    await auditService.log({
      actorId: user.id,
      action: "LOGIN_FAILURE",
      entityType: "auth",
      metadata: { reason: "Invalid password" },
    });
    throw new ApiError(401, "Invalid credentials.", "INVALID_CREDENTIALS");
  }

  const result = await otpService.createOtp({
    email,
    phone,
    userId: user.id,
    purpose: "login",
  });

  await auditService.log({
    actorId: user.id,
    action: "OTP_SENT",
    entityType: "auth",
  });

  return { success: true, expiresAt: result.expiresAt, userId: user.id };
};

const sendChangeEmailOtp = async ({ user, new_email }) => {
  logger.info("Sending change email OTP", {
    userId: user.id,
  });

  if (!new_email) {
    throw new ApiError(422, "New email is required.", "VALIDATION_ERROR");
  }

  const normalizedNewEmail = userService.normalizeEmail(new_email);
  const existingUser = await userService.findByEmailOrPhone({ email: normalizedNewEmail });
  if (existingUser) {
    throw new ApiError(409, "Email already registered.", "DUPLICATE_EMAIL");
  }

  const result = await otpService.createOtp({
    email: new_email,
    userId: user.id,
    purpose: "change_email",
  });

  await auditService.log({
    actorId: user.id,
    action: "OTP_SENT",
    entityType: "auth",
    metadata: { purpose: "change_email" },
  });

  return { success: true, expiresAt: result.expiresAt };
};

const sendChangePhoneOtp = async ({ user, new_phone }) => {
  logger.info("Sending change phone OTP", {
    userId: user.id,
  });

  if (!new_phone) {
    throw new ApiError(422, "New phone is required.", "VALIDATION_ERROR");
  }

  const normalizedNewPhone = userService.normalizePhone(new_phone);
  const existingUser = await userService.findByEmailOrPhone({ phone: normalizedNewPhone });
  if (existingUser) {
    throw new ApiError(409, "Phone already registered.", "DUPLICATE_PHONE");
  }

  const result = await otpService.createOtp({
    phone: new_phone,
    userId: user.id,
    purpose: "change_phone",
  });

  await auditService.log({
    actorId: user.id,
    action: "OTP_SENT",
    entityType: "auth",
    metadata: { purpose: "change_phone" },
  });

  return { success: true, expiresAt: result.expiresAt };
};

const sendChangePasswordOtp = async ({ user, old_password, new_password }) => {
  logger.info("Sending change password OTP", {
    userId: user.id,
  });

  if (!old_password || !new_password) {
    throw new ApiError(422, "Old password and new password are required.", "VALIDATION_ERROR");
  }

  const isPasswordValid = await userService.verifyPassword(user.id, old_password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Old password is incorrect.", "INVALID_CREDENTIALS");
  }

  const result = await otpService.createOtp({
    email: user.email,
    phone: user.phone,
    userId: user.id,
    purpose: "change_password",
  });

  await auditService.log({
    actorId: user.id,
    action: "OTP_SENT",
    entityType: "auth",
    metadata: { purpose: "change_password" },
  });

  return { success: true, expiresAt: result.expiresAt };
};

const verifyOtp = async ({ email, phone, otp, purpose, new_email, new_phone, new_password, user: authenticatedUser }) => {
  logger.info("OTP verification started", {
    purpose,
    hasAuthenticatedUser: !!authenticatedUser,
  });
  
  // Determine lookup contact and which email/phone to pass to otpService
  let lookupContact;
  let otpEmail = email;
  let otpPhone = phone;
  
  if (purpose === "change_email") {
    lookupContact = new_email;
    otpEmail = new_email;
    otpPhone = undefined;
  } else if (purpose === "change_phone") {
    lookupContact = new_phone;
    otpPhone = new_phone;
    otpEmail = undefined;
  } else if (purpose === "change_password") {
    lookupContact = email || phone;
    // For change_password, use the existing user's contact
    if (authenticatedUser) {
      otpEmail = authenticatedUser.email;
      otpPhone = authenticatedUser.phone;
    }
  } else {
    lookupContact = email || phone;
  }

  try {
    await otpService.verifyOtp({ email: otpEmail, phone: otpPhone, otp, purpose });
    logger.info("OTP verification success", { purpose });

    if (purpose === "registration" || purpose === "login") {
      const user = await userService.findByEmailOrPhone({ email, phone });

      if (!user) {
        throw new ApiError(401, "User not found.", "USER_NOT_FOUND");
      }

      if (purpose === "registration" && !user.is_active) {
        await userService.activateUser(user.id);
        user.is_active = true;
      }

      const authTokens = await generateAuthTokens(user);

      await auditService.log({
        actorId: user.id,
        action: purpose === "registration" ? "OTP_VERIFIED" : "LOGIN_SUCCESS",
        entityType: "auth",
        metadata: { purpose },
      });

      let profile;
      try {
        profile = await profileService.getByUserIdAndRole(user.id, user.role);
      } catch (getProfileError) {
        profile = null;
      }

      if (!profile) {
        try {
          profile = await profileService.getOrCreateProfile(user.id, user.role);
      } catch (createProfileError) {
        logger.error("Error creating profile", {
          error: createProfileError.message,
          userId: user.id,
          role: user.role,
        });
        throw createProfileError;
      }
      }

      const profileCompletionRequired = user.role === "driver" &&
        profile.profile_status !== "COMPLETE" &&
        profile.profile_status !== "VERIFIED";

      return {
        ...authTokens,
        user,
        profile,
        profile_completion_required: profileCompletionRequired,
        incomplete_role: profileCompletionRequired ? user.role : null,
        rejection_reason: profile.rejection_reason || null,
      };
    } else if (purpose === "change_email" && authenticatedUser && new_email) {
      const user = await userService.updateUser(authenticatedUser.id, { email: new_email });
      logger.info("Email updated successfully", {
        userId: user.id,
      });
      await auditService.log({
        actorId: user.id,
        action: "OTP_VERIFIED",
        entityType: "auth",
        metadata: { purpose: "change_email", new_email },
      });
      return { success: true, user };
    } else if (purpose === "change_phone" && authenticatedUser && new_phone) {
      const user = await userService.updateUser(authenticatedUser.id, { phone: new_phone });
      logger.info("Phone updated successfully", {
        userId: user.id,
      });
      await auditService.log({
        actorId: user.id,
        action: "OTP_VERIFIED",
        entityType: "auth",
        metadata: { purpose: "change_phone", new_phone },
      });
      return { success: true, user };
    } else if (purpose === "change_password" && authenticatedUser && new_password) {
      const user = await userService.updatePassword(authenticatedUser.id, new_password);
      logger.info("Password updated successfully", {
        userId: user.id,
      });
      await auditService.log({
        actorId: user.id,
        action: "OTP_VERIFIED",
        entityType: "auth",
        metadata: { purpose: "change_password" },
      });
      return { success: true, user };
    } else {
      throw new ApiError(400, "Invalid OTP purpose or missing parameters.", "INVALID_PURPOSE");
    }
  } catch (error) {
    logger.info("OTP verification failed", {
      purpose,
      error: error.message,
    });
    if (error.message?.includes("Invalid or expired OTP")) {
      const userId = authenticatedUser?.id || (await userService.findByEmailOrPhone({ email, phone }))?.id;
      if (userId) {
        await auditService.log({
          actorId: userId,
          action: "OTP_FAILED",
          entityType: "auth",
          metadata: { purpose },
        });
      }
    }
    throw error;
  }
};

const refreshAuthTokens = async (refreshToken) => {
  try {
    const decoded = jwt.verify(refreshToken, env.jwtRefreshSecret);
    const user = await userService.findById(decoded.sub);
    if (!user) {
      throw new ApiError(401, "Invalid refresh token.", "INVALID_REFRESH_TOKEN");
    }

    const authTokens = await generateAuthTokens(user);
    return authTokens;
  } catch (error) {
    logger.error("Token refresh failed");
    throw new ApiError(401, "Invalid refresh token.", "INVALID_REFRESH_TOKEN");
  }
};

const logout = async (userId) => {
  await auditService.log({
    actorId: userId,
    action: "LOGOUT",
    entityType: "auth",
  });
  return { message: "Logged out successfully" };
};

const resendOtp = async ({ email, phone, purpose }) => {
  logger.info("Resending OTP", {
    hasEmail: !!email,
    hasPhone: !!phone,
    purpose,
  });

  if (!email && !phone) {
    throw new ApiError(422, "Either email or phone is required.", "VALIDATION_ERROR");
  }

  if (!purpose || (purpose !== "registration" && purpose !== "login")) {
    throw new ApiError(422, "Valid purpose is required (registration or login).", "VALIDATION_ERROR");
  }

  // Verify user exists
  const user = await userService.findByEmailOrPhone({ email, phone });
  if (!user) {
    throw new ApiError(401, "User not found.", "USER_NOT_FOUND");
  }

  // For registration purpose, ensure user is not already active
  if (purpose === "registration" && user.is_active) {
    throw new ApiError(400, "Account is already verified.", "ALREADY_VERIFIED");
  }

  // Generate and send new OTP
  const result = await otpService.createOtp({
    email,
    phone,
    userId: user.id,
    purpose,
  });

  await auditService.log({
    actorId: user.id,
    action: "OTP_SENT",
    entityType: "auth",
    metadata: { purpose },
  });

  return { success: true, expiresAt: result.expiresAt, userId: user.id };
};

module.exports = {
  generateAuthTokens,
  register,
  login,
  verifyOtp,
  sendChangeEmailOtp,
  sendChangePhoneOtp,
  sendChangePasswordOtp,
  refreshAuthTokens,
  logout,
  resendOtp,
};
