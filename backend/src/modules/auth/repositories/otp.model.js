const mapOtp = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    user_id: row.user_id,
    contact: row.contact,
    code_hash: row.code_hash,
    purpose: row.purpose,
    expires_at: row.expires_at,
    attempts: row.attempts,
    verified_at: row.verified_at,
    created_at: row.created_at
  };
};

module.exports = {
  tableName: "otp_codes",
  mapOtp
};
