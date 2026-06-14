const mapBusLocation = (row) => {
  if (!row) return null;
  return {
    trip_id: row.trip_id,
    latitude: Number(row.latitude),
    longitude: Number(row.longitude),
    recorded_at: row.recorded_at,
    updated_at: row.updated_at
  };
};

module.exports = {
  tableName: "bus_locations",
  mapBusLocation
};
