const crypto = require("crypto");
const env = require("../../../config/env.js");
const db = require("../../../infrastructure/database/db.js");
const { hashValue, compareHash } = require("../../../shared/utils/hash.js");
const ApiError = require("../../../shared/utils/apiError.js");
const logger = require("../../../shared/utils/logger.js");
const userService = require("../../user/services/user.service.js");

const generateOtpCode = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

const buildContact = ({ email, phone }) => {
  if (email) return userService.normalizeEmail(email);
  if (phone) return userService.normalizePhone(phone);
  return null;
};

const createOtp = async ({ email, phone, userId, purpose = "login", password }) => {
  const contact = buildContact({ email, phone });

  if (!contact) {
    throw new ApiError(422, "Either email or phone is required.", "VALIDATION_ERROR");
  }

  if (purpose === "login") {
    const existingUserRow = await userService.findByEmailOrPhone({ email, phone });

    if (!existingUserRow) {
      throw new ApiError(401, "User not found.", "USER_NOT_FOUND");
    }
  }

  const code = generateOtpCode();
  const codeHash = await hashValue(code);
  const expiresAt = new Date(Date.now() + env.otpExpiresInMinutes * 60 * 1000);

  let purposeLabel = purpose;
  if (purpose === "change_email") purposeLabel = "change_email";
  if (purpose === "change_phone") purposeLabel = "change_phone";
  if (purpose === "change_password") purposeLabel = "change_password";

  logger.info("OTP generated - dev mode only", {
    channel: email ? "email" : "phone",
    recipient: contact,
    purpose: purposeLabel,
    code: env.nodeEnv === "production" ? undefined : code,
  });

  await db.query(
    `
    INSERT INTO otp_codes (user_id, contact, code_hash, purpose, expires_at)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
    `,
    [userId || null, contact, codeHash, purpose, expiresAt]
  );

  logger.info("OTP generated", {
    channel: email ? "email" : "phone",
    recipient: contact,
    purpose,
  });

  return {
    expiresAt: expiresAt,
    code: env.nodeEnv === "production" ? undefined : code,
  };
};

const verifyOtp = async ({ email, phone, otp, purpose }) => {
  const contact = buildContact({ email, phone });

  if (!contact) {
    throw new ApiError(422, "Either email or phone is required.", "VALIDATION_ERROR");
  }

  if (!otp) {
    throw new ApiError(422, "OTP is required.", "VALIDATION_ERROR");
  }

  let query = `
    SELECT *
    FROM otp_codes
    WHERE verified_at IS NULL
      AND expires_at > NOW()
      AND contact = $1
      AND attempts < 3
  `;
  const params = [contact];

  if (purpose) {
    query += ` AND purpose = $2`;
    params.push(purpose);
  }

  query += `
    ORDER BY created_at DESC
    LIMIT 1
  `;

  let result;
  try {
    result = await db.query(query, params);
  } catch (dbError) {
    logger.error("OTP database error during verification", {
      error: dbError.message,
    });
    throw dbError;
  }

  const otpRecord = result.rows[0];

  if (!otpRecord) {
    logger.info("OTP not found during verification", {
      recipient: contact,
      purpose,
    });
    throw new ApiError(401, "Invalid or expired OTP.", "INVALID_OTP");
  }

  let isValid;
  try {
    isValid = await compareHash(otp, otpRecord.code_hash);
  } catch (hashError) {
    logger.error("OTP hash comparison error", {
      error: hashError.message,
    });
    throw hashError;
  }

  if (!isValid) {
    logger.info("Invalid OTP attempt", {
      recipient: contact,
      purpose,
    });
    try {
      await db.query("UPDATE otp_codes SET attempts = attempts + 1 WHERE id = $1", [otpRecord.id]);
    } catch (updateError) {
      logger.error("Failed to update OTP attempts count", {
        error: updateError.message,
      });
      throw updateError;
    }
    throw new ApiError(401, "Invalid or expired OTP.", "INVALID_OTP");
  }

  try {
    await db.query("UPDATE otp_codes SET verified_at = NOW() WHERE id = $1", [otpRecord.id]);
  } catch (updateError) {
    logger.error("Failed to mark OTP as verified", {
      error: updateError.message,
    });
    throw updateError;
  }

  return true;
};

module.exports = {
  createOtp,
  verifyOtp,
};
