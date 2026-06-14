const TRIP_STATUS = Object.freeze({
  SCHEDULED: "scheduled",
  ACTIVE: "active",
  COMPLETED: "completed",
  CANCELED: "canceled"
});

const SEAT_STATUS = Object.freeze({
  AVAILABLE: "AVAILABLE",
  RESERVED: "RESERVED",
  BOOKED: "BOOKED"
});

module.exports = {
  TRIP_STATUS,
  SEAT_STATUS
};
