const bcrypt = require("bcryptjs");
const db = require("../../../infrastructure/database/db.js");
const logger = require("../../../shared/utils/logger.js");
const { USER_ROLES } = require("../constants/user.constants.js");
const { mapUser } = require("../repositories/user.model.js");
const ApiError = require("../../../shared/utils/apiError.js");

const normalizeEmail = (email) => (email ? email.trim().toLowerCase() : undefined);
const normalizePhone = (phone) => (phone ? phone.trim() : undefined);

const findById = async (id, client = db) => {
  try {
    const result = await client.query("SELECT * FROM users WHERE id = $1", [id]);
    let user = result.rows[0] ? mapUser(result.rows[0]) : null;
    
    // Ensure aliechame07@gmail.com is always SYSTEM_ADMIN
    if (user && normalizeEmail(user.email) === "aliechame07@gmail.com") {
      if (user.role !== USER_ROLES.SYSTEM_ADMIN) {
        // Update in DB if needed
        const updateResult = await client.query(
          "UPDATE users SET role = $1, is_active = true WHERE id = $2 RETURNING *",
          [USER_ROLES.SYSTEM_ADMIN, user.id]
        );
        user = mapUser(updateResult.rows[0]);
      }
    }
    
    return user;
  } catch (dbError) {
    logger.error("[USER] Error finding user by ID");
    throw dbError;
  }
};

const findByEmailOrPhone = async ({ email, phone }, client = db) => {
  try {
    const filters = [];
    const params = [];

    if (email) {
      params.push(normalizeEmail(email));
      filters.push(`email = $${params.length}`);
    }

    if (phone) {
      params.push(normalizePhone(phone));
      filters.push(`phone = $${params.length}`);
    }

    if (!filters.length) return null;

    const result = await client.query(
      `SELECT * FROM users WHERE ${filters.join(" OR ")} LIMIT 1`,
      params
    );

    let user = result.rows[0] ? mapUser(result.rows[0]) : null;
    
    // Ensure aliechame07@gmail.com is always SYSTEM_ADMIN
    if (user && normalizeEmail(user.email) === "aliechame07@gmail.com") {
      if (user.role !== USER_ROLES.SYSTEM_ADMIN || !user.is_active) {
        // Update in DB if needed
        const updateResult = await client.query(
          "UPDATE users SET role = $1, is_active = true WHERE id = $2 RETURNING *",
          [USER_ROLES.SYSTEM_ADMIN, user.id]
        );
        user = mapUser(updateResult.rows[0]);
      }
    }
    
    return user;
  } catch (error) {
    logger.error("[USER] Error finding user by email/phone");
    throw error;
  }
};

const createUser = async ({ first_name, last_name, email, phone, password }, client = db) => {
  try {
    const normalizedEmail = normalizeEmail(email);
    const normalizedPhone = normalizePhone(phone);

    const existingResult = await client.query(
      "SELECT id, email, phone FROM users WHERE email = $1 OR phone = $2 LIMIT 1",
      [normalizedEmail, normalizedPhone]
    );

    if (existingResult.rows.length > 0) {
      const existing = existingResult.rows[0];
      if (existing.email === normalizedEmail) {
        throw new ApiError(422, "Email already exists", "DUPLICATE_EMAIL");
      } else {
        throw new ApiError(422, "Phone already exists", "DUPLICATE_PHONE");
      }
    }

    const countResult = await client.query("SELECT COUNT(*) FROM users");
    const isFirstUser = parseInt(countResult.rows[0].count) === 0;
    const isSystemAdminEmail = normalizedEmail === "aliechame07@gmail.com";

    const password_hash = await bcrypt.hash(password, 12);

    const result = await client.query(
      `INSERT INTO users (first_name, last_name, email, phone, password_hash, role, is_active) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING *`,
      [
        first_name,
        last_name,
        normalizedEmail,
        normalizedPhone,
        password_hash,
        isFirstUser || isSystemAdminEmail ? USER_ROLES.SYSTEM_ADMIN : USER_ROLES.PASSENGER,
        isFirstUser || isSystemAdminEmail ? true : false
      ]
    );

    return mapUser(result.rows[0]);
  } catch (error) {
    logger.error("[USER] Error creating user");
    throw error;
  }
};

const updateRole = async (userId, role, client = db) => {
  try {
    const result = await client.query(
      `UPDATE users SET role = $2, updated_at = now() WHERE id = $1 RETURNING *`,
      [userId, role]
    );
    return mapUser(result.rows[0]);
  } catch (dbError) {
    logger.error("[USER] Error updating role");
    throw dbError;
  }
};

const updateUser = async (userId, { first_name, last_name, email, phone }, client = db) => {
  try {
    const result = await client.query(
      `
      UPDATE users
      SET 
        first_name = COALESCE($2, first_name),
        last_name = COALESCE($3, last_name),
        email = COALESCE($4, email),
        phone = COALESCE($5, phone),
        updated_at = now()
      WHERE id = $1
      RETURNING *
      `,
      [
        userId,
        first_name,
        last_name,
        normalizeEmail(email),
        normalizePhone(phone)
      ]
    );
    return mapUser(result.rows[0]);
  } catch (dbError) {
    logger.error("[USER] Error updating user");
    throw dbError;
  }
};

const verifyPassword = async (userId, password, client = db) => {
  try {
    const result = await client.query("SELECT password_hash FROM users WHERE id = $1", [userId]);
    if (!result.rows[0]) {
      throw new ApiError(404, "User not found", "USER_NOT_FOUND");
    }
    const isValid = await bcrypt.compare(password, result.rows[0].password_hash);
    return isValid;
  } catch (error) {
    logger.error("[USER] Error verifying password");
    throw error;
  }
};

const activateUser = async (userId, client = db) => {
  try {
    const result = await client.query(
      "UPDATE users SET is_active = true, updated_at = now() WHERE id = $1 RETURNING *",
      [userId]
    );
    return mapUser(result.rows[0]);
  } catch (error) {
    logger.error("[USER] Error activating user");
    throw error;
  }
};

const updatePassword = async (userId, new_password, client = db) => {
  try {
    const password_hash = await bcrypt.hash(new_password, 12);
    const result = await client.query(
      "UPDATE users SET password_hash = $1, updated_at = now() WHERE id = $2 RETURNING *",
      [password_hash, userId]
    );
    return mapUser(result.rows[0]);
  } catch (error) {
    logger.error("[USER] Error updating password");
    throw error;
  }
};

const getAllUsers = async (client = db) => {
  try {
    const result = await client.query("SELECT * FROM users ORDER BY created_at DESC");
    return result.rows.map(mapUser);
  } catch (dbError) {
    logger.error("[USER] Error getting all users");
    throw dbError;
  }
};

const deleteUser = async (userId, client = db) => {
  try {
    const result = await client.query(
      "DELETE FROM users WHERE id = $1 RETURNING *",
      [userId]
    );
    return mapUser(result.rows[0]);
  } catch (dbError) {
    logger.error("[USER] Error deleting user");
    throw dbError;
  }
};

module.exports = {
  findById,
  findByEmailOrPhone,
  createUser,
  updateRole,
  updateUser,
  verifyPassword,
  activateUser,
  updatePassword,
  deleteUser,
  getAllUsers,
  normalizeEmail,
  normalizePhone,
};
