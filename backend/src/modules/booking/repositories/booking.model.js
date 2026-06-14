const mapBooking = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    passenger_id: row.passenger_id,
    trip_id: row.trip_id,
    seat_number: row.seat_number,
    status: row.status,
    expires_at: row.expires_at,
    idempotency_key: row.idempotency_key,
    created_at: row.created_at,
    updated_at: row.updated_at
  };
};

module.exports = {
  tableName: "bookings",
  mapBooking
};
