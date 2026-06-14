const bookingService = require("../modules/booking/services/booking.service.js");
const logger = require("../shared/utils/logger.js");

const runBookingExpirationJob = async () => {
  logger.info("Booking expiration job started");
  await bookingService.releaseExpiredBookings();
  logger.info("Booking expiration job completed");
};

module.exports = {
  runBookingExpirationJob
};
