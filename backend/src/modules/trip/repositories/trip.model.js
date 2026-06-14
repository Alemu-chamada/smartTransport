const mapTrip = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    bus_id: row.bus_id,
    driver_id: row.driver_id,
    route_description: row.route_description,
    origin: row.origin,
    destination: row.destination,
    fare: Number(row.fare),
    currency: row.currency,
    stops: row.stops,
    scheduled_start_time: row.scheduled_start_time,
    actual_start_time: row.actual_start_time,
    actual_end_time: row.actual_end_time,
    status: row.status,
    total_capacity: row.total_capacity,
    avg_speed_kmh: Number(row.avg_speed_kmh),
    created_at: row.created_at,
    updated_at: row.updated_at
  };
};

const mapBus = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    plate_number: row.plate_number,
    capacity: row.capacity,
    driver_id: row.driver_id,
    is_active: row.is_active,
    created_at: row.created_at,
    updated_at: row.updated_at
  };
};

module.exports = {
  tableName: "trips",
  mapTrip,
  mapBus
};
