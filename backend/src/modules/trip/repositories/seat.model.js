const mapSeat = (row) => {
  if (!row) return null;

  return {
    id: row.id,
    trip_id: row.trip_id,
    seat_number: row.seat_number,
    status: row.status,
    created_at: row.created_at,
    updated_at: row.updated_at
  };
};

module.exports = {
  tableName: "seats",
  mapSeat
};
