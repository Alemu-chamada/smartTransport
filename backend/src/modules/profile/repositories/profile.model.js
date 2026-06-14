const mapRoleProfile = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    user_id: row.user_id,
    role: row.role,
    profile_status: row.profile_status,
    profile_data: row.profile_data,
    draft_data: row.draft_data,
    rejection_reason: row.rejection_reason,
    promoted_at: row.promoted_at,
    submitted_at: row.submitted_at,
    verified_at: row.verified_at,
    verifier_admin_id: row.verifier_admin_id,
    created_at: row.created_at,
    updated_at: row.updated_at
  };
};

const mapRoleProfileSchema = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    role: row.role,
    requires_verification: row.requires_verification,
    field_definitions: row.field_definitions,
    schema_version: row.schema_version,
    created_at: row.created_at,
    updated_at: row.updated_at
  };
};

module.exports = {
  tableName: "role_profiles",
  mapRoleProfile,
  mapRoleProfileSchema
};
