const db = require("../../../infrastructure/database/db.js");
const { mapService } = require("../repositories/service.model.js");

const getNearbyServices = async ({ latitude, longitude, radiusKm = 10, type }) => {
  const result = await db.query(
    `SELECT * FROM fn_nearby_services($1, $2, $3, $4)`,
    [latitude, longitude, radiusKm, type || null]
  );
  return result.rows.map(row => ({
    id: row.id,
    type: row.type,
    name: row.name,
    address: row.address,
    latitude: row.latitude,
    longitude: row.longitude,
    distance_km: row.distance_km
  }));
};

const getAllServices = async () => {
  const result = await db.query(
    `SELECT * FROM services WHERE is_active = TRUE ORDER BY name`
  );
  return result.rows.map(mapService);
};

module.exports = {
  getNearbyServices,
  getAllServices
};
