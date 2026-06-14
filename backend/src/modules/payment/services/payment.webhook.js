const asyncHandler = require("../../../shared/utils/asyncHandler.js");
const { success } = require("../../../shared/utils/response.js");
const paymentService = require("./payment.service.js");

const handlePaymentWebhook = asyncHandler(async (req, res) => {
  const result = await paymentService.handleWebhook({
    headers: req.headers,
    payload: req.body
  });

  return success(res, {
    message: "Payment webhook processed successfully",
    data: result
  });
});

module.exports = {
  handlePaymentWebhook
};
