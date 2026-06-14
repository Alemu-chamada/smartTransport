const mapService = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    type: row.type,
    name: row.name,
    address: row.address,
    latitude: row.latitude,
    longitude: row.longitude,
    is_active: row.is_active,
    created_at: row.created_at,
    updated_at: row.updated_at
  };
};

module.exports = {
  mapService
};
