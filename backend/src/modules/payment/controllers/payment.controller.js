const asyncHandler = require("../../../shared/utils/asyncHandler.js");
const { success } = require("../../../shared/utils/response.js");
const paymentService = require("../services/payment.service.js");

const createPaymentSession = asyncHandler(async (req, res) => {
  const result = await paymentService.createPaymentSession({
    user: req.user,
    bookingId: req.body.booking_id
  });

  return success(res, {
    statusCode: 201,
    message: "Payment session created successfully",
    data: result
  });
});

module.exports = {
  createPaymentSession
};
