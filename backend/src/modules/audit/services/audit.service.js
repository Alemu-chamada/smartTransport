const db = require("../../../infrastructure/database/db.js");
const logger = require("../../../shared/utils/logger.js");

const AUDIT_ACTIONS = Object.freeze({
  OTP_SENT: "OTP_SENT",
  OTP_VERIFIED: "OTP_VERIFIED",
  OTP_FAILED: "OTP_FAILED",
  LOGIN_SUCCESS: "LOGIN_SUCCESS",
  LOGIN_FAILURE: "LOGIN_FAILURE",
  LOGOUT: "LOGOUT",
  ACCOUNT_LOCKED: "ACCOUNT_LOCKED",
  ROLE_PROMOTED: "ROLE_PROMOTED",
  ROLE_CHANGED: "ROLE_CHANGED",
  PROFILE_SUBMITTED: "PROFILE_SUBMITTED",
  PROFILE_STATUS_CHANGED: "PROFILE_STATUS_CHANGED",
  PROFILE_VERIFIED: "PROFILE_VERIFIED",
  PROFILE_REJECTED: "PROFILE_REJECTED",
  BOOKING_CREATED: "BOOKING_CREATED",
  BOOKING_CONFIRMED: "BOOKING_CONFIRMED",
  BOOKING_FAILED: "BOOKING_FAILED",
  BOOKING_EXPIRED: "BOOKING_EXPIRED",
  BOOKING_CANCELED: "BOOKING_CANCELLED",   // DB uses double-L
  BOOKING_CANCELLED: "BOOKING_CANCELLED",
  PAYMENT_SESSION_CREATED: "PAYMENT_SESSION_CREATED",
  PAYMENT_WEBHOOK_RECEIVED: "PAYMENT_WEBHOOK_RECEIVED",
  PAYMENT_WEBHOOK_DUPLICATE: "PAYMENT_WEBHOOK_DUPLICATE",
  PAYMENT_REFUND_INITIATED: "PAYMENT_REFUND_INITIATED",
  PAYMENT_CREATED: "PAYMENT_SESSION_CREATED",
  PAYMENT_SUCCESS: "PAYMENT_WEBHOOK_RECEIVED",
  PAYMENT_FAILURE: "PAYMENT_WEBHOOK_RECEIVED",
  TRIP_SCHEDULED: "TRIP_SCHEDULED",
  TRIP_STARTED: "TRIP_STARTED",
  TRIP_COMPLETED: "TRIP_COMPLETED",
  TRIP_CANCELED: "TRIP_CANCELLED",         // DB uses double-L
  TRIP_CANCELLED: "TRIP_CANCELLED",
  ADMIN_ACTION: "ADMIN_ACTION",
  SYSTEM_EVENT: "SYSTEM_EVENT",
  // These don't exist in DB ENUM — map to closest valid value
  USER_UPDATED: "ADMIN_ACTION",
  PASSWORD_CHANGED: "ADMIN_ACTION"
});

const log = async ({ actorId, action, entityType, entityId, metadata = {}, ipAddress, userAgent, targetUserId }, client = db) => {
  try {
    // entity_type is NOT NULL in DB - use a default if not provided
    const safeEntityType = entityType || action || "SYSTEM";

    const result = await client.query(
      `
      INSERT INTO audit_logs (actor_id, action, entity_type, entity_id, metadata, ip_address, user_agent)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
      `,
      [
        actorId || null,
        action,
        safeEntityType,
        entityId || null,
        JSON.stringify(metadata),
        ipAddress || null,
        userAgent || null
      ]
    );
    logger.info("Audit log inserted successfully", {
      id: result.rows[0].id,
      action,
    });
    return result.rows[0];
  } catch (dbError) {
    logger.error("Error inserting audit log", {
      error: dbError.message,
      action,
    });
    // Don't throw - audit log failure should not break business logic
    return null;
  }
};

const listLogs = async ({ page = 1, limit = 25, action, startDate, endDate } = {}) => {
  const safePage = Math.max(Number(page) || 1, 1);
  const safeLimit = Math.min(Math.max(Number(limit) || 25, 1), 100);
  const filters = [];
  const params = [];

  if (action) {
    params.push(action);
    filters.push(`action = $${params.length}`);
  }
  if (startDate) {
    params.push(new Date(startDate));
    filters.push(`timestamp >= $${params.length}`);
  }
  if (endDate) {
    params.push(new Date(endDate));
    filters.push(`timestamp <= $${params.length}`);
  }

  const whereClause = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
  const offset = (safePage - 1) * safeLimit;

  const [itemsResult, countResult] = await Promise.all([
    db.query(
      `
      SELECT *
      FROM audit_logs
      ${whereClause}
      ORDER BY timestamp DESC
      LIMIT $${params.length + 1}
      OFFSET $${params.length + 2}
      `,
      [...params, safeLimit, offset]
    ),
    db.query(`SELECT COUNT(*)::int AS total FROM audit_logs ${whereClause}`, params)
  ]);

  const total = countResult.rows[0].total;

  return {
    items: itemsResult.rows,
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      pages: Math.ceil(total / safeLimit)
    }
  };
};

module.exports = {
  AUDIT_ACTIONS,
  log,
  listLogs
};
