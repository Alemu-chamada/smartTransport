const BOOKING_STATUS = Object.freeze({
  RESERVED: "reserved",
  PAYMENT_PENDING: "payment_pending",
  CONFIRMED: "confirmed",
  FAILED: "failed",
  EXPIRED: "expired"
});

const ALLOWED_TRANSITIONS = Object.freeze({
  [BOOKING_STATUS.RESERVED]: [
    BOOKING_STATUS.PAYMENT_PENDING,
    BOOKING_STATUS.FAILED,
    BOOKING_STATUS.EXPIRED
  ],
  [BOOKING_STATUS.PAYMENT_PENDING]: [
    BOOKING_STATUS.CONFIRMED,
    BOOKING_STATUS.FAILED,
    BOOKING_STATUS.EXPIRED
  ],
  [BOOKING_STATUS.CONFIRMED]: [],
  [BOOKING_STATUS.FAILED]: [],
  [BOOKING_STATUS.EXPIRED]: []
});

const canTransition = (from, to) => {
  return Boolean(ALLOWED_TRANSITIONS[from] && ALLOWED_TRANSITIONS[from].includes(to));
};

module.exports = {
  BOOKING_STATUS,
  ALLOWED_TRANSITIONS,
  canTransition
};
