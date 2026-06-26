const ApiError = require("../../../shared/utils/apiError.js");
const db = require("../../../infrastructure/database/db.js");
const userService = require("../../user/services/user.service.js");
const { ASSIGNABLE_ROLES } = require("../../user/constants/user.constants.js");
const auditService = require("../../audit/services/audit.service.js");
const { TRIP_STATUS } = require("../../trip/constants/trip.constants.js");
const redis = require("../../../infrastructure/redis/redis.js");

const assignUserRole = async ({ actor, targetUserId, role }) => {
  if (!ASSIGNABLE_ROLES.includes(role)) {
    throw new ApiError(
      422,
      "Role must be either driver or system_admin.",
      "VALIDATION_ERROR"
    );
  }

  if (actor.id.toString() === targetUserId.toString()) {
    throw new ApiError(403, "Users cannot update their own role.", "FORBIDDEN");
  }

  const targetUser = await userService.findById(targetUserId);

  if (!targetUser) {
    throw new ApiError(404, "User not found.", "USER_NOT_FOUND");
  }

  const previousRole = targetUser.role;
  const updatedUser = await userService.updateRole(targetUserId, role);

  await auditService.log({
    actorId: actor.id,
    targetUserId,
    action: auditService.AUDIT_ACTIONS.ROLE_CHANGED,
    metadata: {
      previousRole,
      newRole: role
    }
  });

  return updatedUser;
};

const getMetrics = async () => {
  const queries = await Promise.all([
    db.query("SELECT COUNT(*)::int AS count FROM users"),
    db.query("SELECT COUNT(*)::int AS count FROM trips"),
    db.query("SELECT COUNT(*)::int AS count FROM bookings"),
    db.query(
      `SELECT COUNT(*)::int AS count
       FROM trips
       WHERE status = $1
         AND scheduled_start_time >= now()`,
      [TRIP_STATUS.SCHEDULED]
    ),
    db.query(
      `SELECT COALESCE(SUM(amount), 0)::numeric AS total_revenue
       FROM payments
       WHERE gateway_status = $1`,
      ['success']
    ),
    db.query(
      `SELECT COUNT(*)::int AS count
       FROM users
       WHERE role = 'driver' AND is_active = TRUE`
    )
  ]);

  const totalUsers = queries[0].rows[0].count;
  const totalTrips = queries[1].rows[0].count;
  const totalBookings = queries[2].rows[0].count;
  const activeTrips = queries[3].rows[0].count;
  const totalRevenue = Number(queries[4].rows[0].total_revenue || 0);
  const activeDrivers = queries[5].rows[0].count;

  return {
    total_users: totalUsers,
    total_trips: totalTrips,
    total_bookings: totalBookings,
    total_revenue: totalRevenue,
    active_drivers: activeDrivers
  };
};

const getAuditLogs = (query) => {
  return auditService.listLogs({
    page: query.page,
    limit: query.limit,
    action: query.action,
    startDate: query.start_date,
    endDate: query.end_date
  });
};

const getSystemHealth = async () => {
  let redisStatus = false;
  let dbStatus = false;

  try {
    const pong = await redis.ping();
    redisStatus = pong === "PONG";
  } catch (error) {
    redisStatus = false;
  }

  try {
    await db.query("SELECT 1");
    dbStatus = true;
  } catch (error) {
    dbStatus = false;
  }

  return {
    database: dbStatus,
    redis: redisStatus
  };
};

const getBuses = async () => {
  const result = await db.query(
    `SELECT id, plate_number, capacity, is_active, driver_id, created_at
     FROM buses
     WHERE is_active = TRUE
     ORDER BY plate_number ASC`
  );
  return result.rows;
};

const createBus = async ({ plate_number, capacity, driver_id }) => {
  if (!plate_number || !capacity) {
    throw new ApiError(422, "Plate number and capacity are required.", "VALIDATION_ERROR");
  }
  const result = await db.query(
    `INSERT INTO buses (plate_number, capacity, driver_id, is_active)
     VALUES ($1, $2, $3, TRUE)
     RETURNING *`,
    [plate_number.toUpperCase().trim(), capacity, driver_id || null]
  );
  return result.rows[0];
};

const getDrivers = async () => {
  const result = await db.query(
    `SELECT u.id, u.full_name, u.email, u.phone, u.is_active
     FROM users u
     WHERE u.role = 'driver' AND u.is_active = TRUE
     ORDER BY u.full_name ASC`
  );
  return result.rows;
};

const getUsers = async ({ page = 1, limit = 50, role, search } = {}) => {
  const offset = (page - 1) * limit;
  const params = [];
  const conditions = [];

  if (role) {
    params.push(role);
    conditions.push(`role = $${params.length}`);
  }

  if (search) {
    params.push(`%${search}%`);
    conditions.push(`(full_name ILIKE $${params.length} OR email ILIKE $${params.length})`);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  params.push(limit);
  params.push(offset);

  const result = await db.query(
    `SELECT id, full_name, email, phone, role, is_active, created_at
     FROM users
     ${where}
     ORDER BY created_at DESC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );

  const countResult = await db.query(
    `SELECT COUNT(*)::int AS total FROM users ${where}`,
    params.slice(0, params.length - 2)
  );

  return {
    users: result.rows,
    total: countResult.rows[0].total,
    page: Number(page),
    limit: Number(limit),
  };
};

module.exports = {
  assignUserRole,
  getMetrics,
  getAuditLogs,
  getSystemHealth,
  getBuses,
  createBus,
  getDrivers,
  getUsers,
};
