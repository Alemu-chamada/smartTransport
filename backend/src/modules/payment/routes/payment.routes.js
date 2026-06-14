const router = require("express").Router();
const authMiddleware = require("../../../shared/middleware/auth.middleware.js");
const restrictTo = require("../../../shared/middleware/rbac.middleware.js");
const profileGate = require("../../../shared/middleware/profileGate.middleware.js");
const paymentController = require("../controllers/payment.controller.js");
const paymentWebhook = require("../services/payment.webhook.js");
const { paymentRateLimiter } = require("../../../shared/middleware/rateLimit.middleware.js");
const { USER_ROLES } = require("../../../modules/user/constants/user.constants.js");

router.post(
  "/create",
  paymentRateLimiter,
  authMiddleware,
  restrictTo(USER_ROLES.PASSENGER),
  profileGate,
  paymentController.createPaymentSession
);
router.post("/webhook", paymentRateLimiter, paymentWebhook.handlePaymentWebhook);

module.exports = router;
