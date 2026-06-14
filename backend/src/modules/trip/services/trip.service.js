const db = require("../../../infrastructure/database/db.js");
const ApiError = require("../../../shared/utils/apiError.js");
const { mapTrip, mapBus } = require("../repositories/trip.model.js");
const userService = require("../../user/services/user.service.js");

const validateTripPayload = ({ bus_id, driver_id, route_description, origin, destination, scheduled_start_time, total_capacity }) => {
  if (!bus_id) {
    throw new ApiError(422, "Bus ID is required.", "VALIDATION_ERROR");
  }
  if (!driver_id) {
    throw new ApiError(422, "Driver ID is required.", "VALIDATION_ERROR");
  }
  if (!route_description) {
    throw new ApiError(422, "Route description is required.", "VALIDATION_ERROR");
  }
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
    const bus = await getBusById(payload.bus_id, client);
    if (!bus || !bus.is_active) {
      throw new ApiError(422, "Bus not found or inactive.", "BUS_NOT_FOUND");
    }

    const driver = await userService.findById(payload.driver_id, client);
    if (!driver) {
      throw new ApiError(422, "Driver not found.", "DRIVER_NOT_FOUND");
    }

    const tripResult = await client.query(
      `
      INSERT INTO trips (bus_id, driver_id, route_description, origin, destination, scheduled_start_time, status, total_capacity, avg_speed_kmh)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
      `,
      [
        payload.bus_id,
        payload.driver_id,
        payload.route_description,
        payload.origin,
        payload.destination,
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

const getScheduledTrips = async () => {
  const result = await db.query(
    `
    SELECT *
    FROM trips
    WHERE status = $1
      AND scheduled_start_time >= now()
    ORDER BY scheduled_start_time ASC
    `,
    ['scheduled']
  );
  return result.rows.map(mapTrip);
};

const getNearbyTrips = async ({ origin, destination }) => {
  const filters = ["status = $1", "scheduled_start_time >= now()"];
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

module.exports = {
  createTrip,
  getScheduledTrips,
  getNearbyTrips,
  findScheduledTripById,
  findActiveTripById,
  getTripById,
  getTripOccupiedSeats,
  getBusById
};
