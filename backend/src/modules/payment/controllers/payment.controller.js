const asyncHandler = require("../../../shared/utils/asyncHandler.js");
const { success } = require("../../../shared/utils/response.js");
const paymentService = require("../services/payment.service.js");
const logger = require("../../../shared/utils/logger.js");

const createPaymentSession = asyncHandler(async (req, res) => {
  const result = await paymentService.createPaymentSession({
    user: req.user,
    bookingId: req.body.booking_id
  });
  return success(res, { statusCode: 201, message: "Payment session created successfully", data: result });
});

const confirmPayment = asyncHandler(async (req, res) => {
  const result = await paymentService.confirmPaymentFromFrontend({
    user: req.user,
    paymentIntentId: req.body.payment_intent_id,
    bookingId: req.body.booking_id
  });
  return success(res, { message: "Payment confirmed. Booking is now confirmed.", data: result });
});

/**
 * Stripe webhook handler
 * Must receive raw body (not parsed JSON) for signature verification
 */
const handleStripeWebhook = asyncHandler(async (req, res) => {
  const signature = req.headers["stripe-signature"];

  if (!signature) {
    logger.warn("Stripe webhook missing signature header");
    return res.status(400).json({ error: "Missing stripe-signature header" });
  }

  try {
    const result = await paymentService.handleStripeWebhook({
      rawBody: req.body, // raw buffer - must use express.raw()
      signature
    });

    return res.status(200).json(result);
  } catch (error) {
    logger.error("Stripe webhook error", { error: error.message });
    return res.status(400).json({ error: error.message });
  }
});

module.exports = {
  createPaymentSession,
  confirmPayment,
  handleStripeWebhook,
};
