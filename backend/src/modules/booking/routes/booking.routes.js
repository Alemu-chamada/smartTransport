const router = require("express").Router();
const authMiddleware = require("../../../shared/middleware/auth.middleware.js");
const restrictTo = require("../../../shared/middleware/rbac.middleware.js");
const profileGate = require("../../../shared/middleware/profileGate.middleware.js");
const bookingController = require("../controllers/booking.controller.js");
const { bookingRateLimiter } = require("../../../shared/middleware/rateLimit.middleware.js");
const { USER_ROLES } = require("../../user/constants/user.constants.js");

router.post(
  "/",
  bookingRateLimiter,
  authMiddleware,
  restrictTo(USER_ROLES.PASSENGER),
  profileGate,
  bookingController.createBooking
);
router.get("/my", bookingRateLimiter, authMiddleware, bookingController.getMyBookings);
router.patch("/:id/cancel", bookingRateLimiter, authMiddleware, bookingController.cancelBooking);

module.exports = router;
