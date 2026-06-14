const db = require("../../../infrastructure/database/db.js");
const ApiError = require("../../../shared/utils/apiError.js");
const tripService = require("../../trip/services/trip.service.js");
const { mapBusLocation } = require("../repositories/tracking.model.js");

const validateCoordinates = ({ latitude, longitude }) => {
  const lat = Number(latitude);
  const lng = Number(longitude);
  if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
    throw new ApiError(422, "Latitude must be between -90 and 90.", "VALIDATION_ERROR");
  }
  if (!Number.isFinite(lng) || lng < -180 || lng > 180) {
    throw new ApiError(422, "Longitude must be between -180 and 180.", "VALIDATION_ERROR");
  }
  return { latitude: lat, longitude: lng };
};

const getLocationByTripId = async (tripId, client = db) => {
  const result = await client.query(
    "SELECT * FROM bus_locations WHERE trip_id = $1",
    [tripId]
  );
  return mapBusLocation(result.rows[0]);
};

const saveLocationUpdate = async ({ user, tripId, latitude, longitude }) => {
  if (!tripId) {
    throw new ApiError(422, "Trip ID is required.", "VALIDATION_ERROR");
  }
  const trip = await tripService.getTripById(tripId);
  if (!trip) {
    throw new ApiError(404, "Trip not found.", "TRIP_NOT_FOUND");
  }
  const coordinates = validateCoordinates({ latitude, longitude });

  const result = await db.query(
    `
    INSERT INTO bus_locations (trip_id, latitude, longitude, recorded_at)
    VALUES ($1, $2, $3, NOW())
    ON CONFLICT (trip_id)
    DO UPDATE SET
      latitude = EXCLUDED.latitude,
      longitude = EXCLUDED.longitude,
      recorded_at = EXCLUDED.recorded_at,
      updated_at = NOW()
    RETURNING *
    `,
    [tripId, coordinates.latitude, coordinates.longitude]
  );
  return mapBusLocation(result.rows[0]);
};

const getNearbyActiveTrips = async ({ latitude, longitude, radiusKm = 20 }) => {
  validateCoordinates({ latitude, longitude });
  const result = await db.query(
    `
    SELECT bl.*, t.*
    FROM bus_locations bl
    JOIN trips t ON t.id = bl.trip_id
    WHERE t.status = 'active'
      AND fn_haversine_km($1, $2, bl.latitude, bl.longitude) <= $3
    ORDER BY fn_haversine_km($1, $2, bl.latitude, bl.longitude)
    `,
    [latitude, longitude, radiusKm]
  );
  return result.rows.map(row => ({
    ...mapBusLocation(row),
    trip: {
      id: row.id,
      bus_id: row.bus_id,
      driver_id: row.driver_id,
      route_description: row.route_description,
      origin: row.origin,
      destination: row.destination,
      scheduled_start_time: row.scheduled_start_time,
      actual_start_time: row.actual_start_time,
      actual_end_time: row.actual_end_time,
      status: row.status,
      total_capacity: row.total_capacity,
      avg_speed_kmh: row.avg_speed_kmh
    }
  }));
};

module.exports = {
  saveLocationUpdate,
  getLocationByTripId,
  getNearbyActiveTrips
};
