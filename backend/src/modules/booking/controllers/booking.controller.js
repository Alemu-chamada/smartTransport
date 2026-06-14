const asyncHandler = require("../../../shared/utils/asyncHandler.js");
const { success } = require("../../../shared/utils/response.js");
const bookingService = require("../services/booking.service.js");

const createBooking = asyncHandler(async (req, res) => {
  const booking = await bookingService.createBooking({
    user: req.user,
    payload: req.body
  });

  return success(res, {
    statusCode: 201,
    message: "Booking reserved successfully",
    data: { booking }
  });
});

const getMyBookings = asyncHandler(async (req, res) => {
  const bookings = await bookingService.getMyBookings(req.user);

  return success(res, {
    message: "Bookings fetched successfully",
    data: { bookings }
  });
});

const cancelBooking = asyncHandler(async (req, res) => {
  const booking = await bookingService.cancelBooking({
    user: req.user,
    bookingId: req.params.id
  });

  return success(res, {
    message: "Booking canceled successfully",
    data: { booking }
  });
});

module.exports = {
  createBooking,
  getMyBookings,
  cancelBooking
};
