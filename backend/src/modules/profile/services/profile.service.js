const db = require("../../../infrastructure/database/db.js");
const logger = require("../../../shared/utils/logger.js");
const ApiError = require("../../../shared/utils/apiError.js");
const { PROFILE_STATUS } = require("../constants/profile.constants.js");
const { USER_ROLES } = require("../../user/constants/user.constants.js");
const { mapRoleProfile, mapRoleProfileSchema } = require("../repositories/profile.model.js");

const getRoleProfileSchema = async (role) => {
  logger.info("[PROFILE SERVICE] getRoleProfileSchema called with role:", role);
  try {
    const result = await db.query(
      "SELECT * FROM role_profile_schemas WHERE role = $1",
      [role]
    );
    logger.info("[PROFILE SERVICE] getRoleProfileSchema result:", result.rows[0]);
    return mapRoleProfileSchema(result.rows[0]);
  } catch (dbError) {
    logger.error("[PROFILE SERVICE] getRoleProfileSchema ERROR:", dbError);
    throw dbError;
  }
};

const getOrCreateProfile = async (userId, role = 'passenger') => {
  logger.info("[PROFILE SERVICE] getOrCreateProfile called with userId:", userId, "role:", role);
  try {
    const result = await db.query(
      `
      INSERT INTO role_profiles (user_id, role, profile_status)
      VALUES ($1, $2, $3)
      ON CONFLICT (user_id, role) DO UPDATE
      SET user_id = EXCLUDED.user_id
      RETURNING *
      `,
      [userId, role, 'INCOMPLETE']
    );
    logger.info("[PROFILE SERVICE] getOrCreateProfile result:", result.rows[0]);
    return mapRoleProfile(result.rows[0]);
  } catch (dbError) {
    logger.error("[PROFILE SERVICE] getOrCreateProfile ERROR:", dbError);
    throw dbError;
  }
};

const getByUserIdAndRole = async (userId, role) => {
  logger.info("[PROFILE SERVICE] getByUserIdAndRole called with userId:", userId, "role:", role);
  try {
    const result = await db.query(
      "SELECT * FROM role_profiles WHERE user_id = $1 AND role = $2",
      [userId, role]
    );
    logger.info("[PROFILE SERVICE] getByUserIdAndRole result rows:", result.rows);
    return mapRoleProfile(result.rows[0]);
  } catch (dbError) {
    logger.error("[PROFILE SERVICE] getByUserIdAndRole ERROR:", dbError);
    throw dbError;
  }
};

const getByUserId = async (userId) => {
  logger.info("[PROFILE SERVICE] getByUserId called with userId:", userId);
  try {
    const result = await db.query(
      "SELECT * FROM role_profiles WHERE user_id = $1",
      [userId]
    );
    return result.rows.map(mapRoleProfile);
  } catch (dbError) {
    logger.error("[PROFILE SERVICE] getByUserId ERROR:", dbError);
    throw dbError;
  }
};

const saveProfile = async ({ userId, role, profile_status, profile_data = null, rejection_reason = null }) => {
  logger.info("[PROFILE SERVICE] saveProfile called with:", { userId, role, profile_status, profile_data, rejection_reason });
  try {
    const result = await db.query(
      `
      INSERT INTO role_profiles (user_id, role, profile_status, profile_data, rejection_reason)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (user_id, role) DO UPDATE
      SET profile_status = EXCLUDED.profile_status,
          profile_data = EXCLUDED.profile_data,
          rejection_reason = EXCLUDED.rejection_reason,
          updated_at = now()
      RETURNING *
      `,
      [userId, role, profile_status, profile_data, rejection_reason]
    );
    logger.info("[PROFILE SERVICE] saveProfile result:", result.rows[0]);
    return mapRoleProfile(result.rows[0]);
  } catch (dbError) {
    logger.error("[PROFILE SERVICE] saveProfile ERROR:", dbError);
    throw dbError;
  }
};

const completeProfile = async ({ user, payload }) => {
  logger.info("[PROFILE SERVICE] completeProfile called with user:", user.id, "payload:", payload);
  const schema = await getRoleProfileSchema(user.role);
  if (!schema) {
    throw new ApiError(404, "Profile schema not found for this role.", "SCHEMA_NOT_FOUND");
  }

  const validationErrors = {};

  for (const field of schema.field_definitions || []) {
    const value = payload[field.name];
    if (field.required && (value === undefined || value === null || String(value).trim() === "")) {
      validationErrors[field.name] = `${field.label} is required.`;
      continue;
    }
    if (field.validation_regex && value && !new RegExp(field.validation_regex).test(value)) {
      validationErrors[field.name] = `${field.label} format is invalid.`;
    }
  }

  if (Object.keys(validationErrors).length > 0) {
    throw new ApiError(422, "Profile validation failed.", "VALIDATION_ERROR", validationErrors);
  }

  const profileStatus = schema.requires_verification ? 'PENDING_VERIFICATION' : 'COMPLETE';

  return saveProfile({
    userId: user.id,
    role: user.role,
    profile_status: profileStatus,
    profile_data: payload,
    rejection_reason: null
  });
};

module.exports = {
  getRoleProfileSchema,
  getOrCreateProfile,
  getByUserIdAndRole,
  getByUserId,
  saveProfile,
  completeProfile
};
