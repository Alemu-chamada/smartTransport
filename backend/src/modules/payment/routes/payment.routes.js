const router = require("express").Router();
const authMiddleware = require("../../../shared/middleware/auth.middleware.js");
const restrictTo = require("../../../shared/middleware/rbac.middleware.js");
const profileGate = require("../../../shared/middleware/profileGate.middleware.js");
const paymentController = require("../controllers/payment.controller.js");
const { paymentRateLimiter } = require("../../../shared/middleware/rateLimit.middleware.js");
const { USER_ROLES } = require("../../../modules/user/constants/user.constants.js");
const express = require("express");

// Create payment session (passenger only)
router.post(
  "/create",
  paymentRateLimiter,
  authMiddleware,
  restrictTo(USER_ROLES.PASSENGER),
  profileGate,
  paymentController.createPaymentSession
);

// Confirm payment after Stripe succeeds on frontend
// Frontend calls this after stripe.confirmPayment() succeeds
router.post(
  "/confirm",
  paymentRateLimiter,
  authMiddleware,
  restrictTo(USER_ROLES.PASSENGER),
  paymentController.confirmPayment
);

// Stripe webhook - MUST use raw body parser for signature verification
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  paymentController.handleStripeWebhook
);

module.exports = router;
