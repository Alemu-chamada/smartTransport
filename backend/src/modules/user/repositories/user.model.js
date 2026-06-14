const mapUser = (row) => {
  if (!row) return null;

  return {
    id: row.id,
    first_name: row.first_name,
    last_name: row.last_name,
    full_name: row.full_name,
    email: row.email,
    phone: row.phone,
    role: row.role,
    is_active: row.is_active,
    last_role_changed_at: row.last_role_changed_at,
    created_at: row.created_at,
    updated_at: row.updated_at
  };
};

module.exports = {
  tableName: "users",
  mapUser
};
