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

module.exports = {
  assignUserRole,
  getMetrics,
  getAuditLogs,
  getSystemHealth
};
