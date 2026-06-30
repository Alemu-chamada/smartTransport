const db = require("../../../infrastructure/database/db.js");
const ApiError = require("../../../shared/utils/apiError.js");
const { mapTrip, mapBus } = require("../repositories/trip.model.js");
const userService = require("../../user/services/user.service.js");

const validateTripPayload = ({ origin, destination, scheduled_start_time, total_capacity }) => {
  if (!origin) {
    throw new ApiError(422, "Origin is required.", "VALIDATION_ERROR");
  }
  if (!destination) {
    throw new ApiError(422, "Destination is required.", "VALIDATION_ERROR");
  }
  if (!scheduled_start_time || Number.isNaN(new Date(scheduled_start_time).getTime())) {
    throw new ApiError(422, "Valid scheduled start time is required.", "VALIDATION_ERROR");
  }
  if (!total_capacity || total_capacity < 1) {
    throw new ApiError(422, "Total capacity must be a positive integer.", "VALIDATION_ERROR");
  }
};

const getBusById = async (busId, client = db) => {
  const result = await client.query(
    "SELECT * FROM buses WHERE id = $1",
    [busId]
  );
  return mapBus(result.rows[0]);
};

const createTrip = async ({ actor, payload }) => {
  validateTripPayload(payload);

  return db.transaction(async (client) => {
    // bus_id and driver_id are optional — only validate if provided
    if (payload.bus_id) {
      const bus = await getBusById(payload.bus_id, client);
      if (!bus || !bus.is_active) {
        throw new ApiError(422, "Bus not found or inactive.", "BUS_NOT_FOUND");
      }
    }

    if (payload.driver_id) {
      const driver = await userService.findById(payload.driver_id, client);
      if (!driver) {
        throw new ApiError(422, "Driver not found.", "DRIVER_NOT_FOUND");
      }
    }

    const tripResult = await client.query(
      `
      INSERT INTO trips (bus_id, driver_id, route_description, origin, destination, fare, currency, scheduled_start_time, status, total_capacity, avg_speed_kmh)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
      `,
      [
        payload.bus_id || null,
        payload.driver_id || null,
        payload.route_description || `${payload.origin} → ${payload.destination}`,
        payload.origin,
        payload.destination,
        payload.fare || 0,
        payload.currency || 'ETB',
        new Date(payload.scheduled_start_time),
        payload.status || 'scheduled',
        payload.total_capacity,
        payload.avg_speed_kmh || 60.0
      ]
    );

    const trip = mapTrip(tripResult.rows[0]);
    return { trip };
  });
};

const getScheduledTrips = async ({ all = false } = {}) => {
  let query;
  let params;
  if (all) {
    // Admin view — return all trips regardless of status/time
    query = `SELECT * FROM trips ORDER BY scheduled_start_time DESC`;
    params = [];
  } else {
    // Passenger view — all scheduled trips (no time filter so timezone
    // differences never accidentally hide newly-created trips)
    query = `
      SELECT *
      FROM trips
      WHERE status = $1
      ORDER BY scheduled_start_time ASC
    `;
    params = ['scheduled'];
  }
  const result = await db.query(query, params);
  return result.rows.map(mapTrip);
};

const getNearbyTrips = async ({ origin, destination }) => {
  const filters = ["status = $1"];
  const params = ['scheduled'];

  if (origin) {
    params.push(`%${origin.trim()}%`);
    filters.push(`origin ILIKE $${params.length}`);
  }

  if (destination) {
    params.push(`%${destination.trim()}%`);
    filters.push(`destination ILIKE $${params.length}`);
  }

  const result = await db.query(
    `
    SELECT *
    FROM trips
    WHERE ${filters.join(" AND ")}
    ORDER BY scheduled_start_time ASC
    LIMIT 50
    `,
    params
  );
  return result.rows.map(mapTrip);
};

const findScheduledTripById = async (tripId, client = db) => {
  const result = await client.query(
    `
    SELECT *
    FROM trips
    WHERE id = $1
      AND status = $2
      AND scheduled_start_time >= now()
    LIMIT 1
    `,
    [tripId, 'scheduled']
  );
  return mapTrip(result.rows[0]);
};

const findActiveTripById = async (tripId, client = db) => {
  const result = await client.query(
    `
    SELECT *
    FROM trips
    WHERE id = $1
      AND status = $2
    LIMIT 1
    `,
    [tripId, 'active']
  );
  return mapTrip(result.rows[0]);
};

const getTripById = async (tripId, client = db) => {
  const result = await client.query(
    "SELECT * FROM trips WHERE id = $1",
    [tripId]
  );
  return mapTrip(result.rows[0]);
};

const getTripOccupiedSeats = async (tripId) => {
  const result = await db.query(
    "SELECT seat_number FROM bookings WHERE trip_id = $1 AND status IN ('reserved', 'payment_pending', 'confirmed')",
    [tripId]
  );
  return result.rows.map(row => row.seat_number);
};

const deleteTrip = async ({ actor, tripId }) => {
  const trip = await getTripById(tripId);
  if (!trip) throw new ApiError(404, "Trip not found.", "NOT_FOUND");
  await db.query("UPDATE bookings SET status = 'failed' WHERE trip_id = $1 AND status IN ('reserved','payment_pending')", [tripId]);
  await db.query("DELETE FROM trips WHERE id = $1", [tripId]);
  return { deleted: true };
};

const updateTrip = async ({ actor, tripId, payload }) => {
  const trip = await getTripById(tripId);
  if (!trip) throw new ApiError(404, "Trip not found.", "NOT_FOUND");

  // Validate driver_id if provided
  if (payload.driver_id) {
    const driver = await userService.findById(payload.driver_id);
    if (!driver) throw new ApiError(422, "Driver not found.", "DRIVER_NOT_FOUND");
  }

  // Validate bus_id if provided
  if (payload.bus_id) {
    const bus = await getBusById(payload.bus_id);
    if (!bus || !bus.is_active) throw new ApiError(422, "Bus not found or inactive.", "BUS_NOT_FOUND");
  }

  const result = await db.query(
    `UPDATE trips SET
       origin               = COALESCE($1,  origin),
       destination          = COALESCE($2,  destination),
       fare                 = COALESCE($3,  fare),
       currency             = COALESCE($4,  currency),
       scheduled_start_time = COALESCE($5,  scheduled_start_time),
       total_capacity       = COALESCE($6,  total_capacity),
       status               = COALESCE($7,  status),
       driver_id            = COALESCE($8,  driver_id),
       bus_id               = COALESCE($9,  bus_id),
       updated_at           = now()
     WHERE id = $10 RETURNING *`,
    [
      payload.origin || null,
      payload.destination || null,
      payload.fare != null ? payload.fare : null,
      payload.currency || null,
      payload.scheduled_start_time ? new Date(payload.scheduled_start_time) : null,
      payload.total_capacity || null,
      payload.status || null,
      payload.driver_id || null,
      payload.bus_id !== undefined ? (payload.bus_id || null) : null,
      tripId,
    ]
  );
  return { trip: mapTrip(result.rows[0]) };
};

module.exports = {
  createTrip, getScheduledTrips, getNearbyTrips,
  findScheduledTripById, findActiveTripById,
  getTripById, getTripOccupiedSeats, getBusById,
  deleteTrip, updateTrip,
};
