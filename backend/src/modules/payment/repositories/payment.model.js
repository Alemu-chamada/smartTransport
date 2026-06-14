const mapPayment = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    booking_id: row.booking_id,
    gateway_name: row.gateway_name,
    gateway_txn_id: row.gateway_txn_id,
    gateway_status: row.gateway_status,
    webhook_event_id: row.webhook_event_id,
    idempotency_key: row.idempotency_key,
    amount: Number(row.amount),
    currency: row.currency,
    is_refunded: row.is_refunded,
    refunded_at: row.refunded_at,
    created_at: row.created_at,
    updated_at: row.updated_at
  };
};

module.exports = {
  mapPayment,
  tableName: "payments"
};
