const router = require("express").Router();
const authMiddleware = require("../../../shared/middleware/auth.middleware.js");
const restrictTo = require("../../../shared/middleware/rbac.middleware.js");
const trackingController = require("../controllers/tracking.controller.js");
const { USER_ROLES } = require("../../user/constants/user.constants.js");

router.post(
  "/location",
  authMiddleware,
  restrictTo(USER_ROLES.DRIVER),
  trackingController.saveLocation
);

router.get(
  "/location/:trip_id",
  authMiddleware,
  trackingController.getLocationByTripId
);

router.get(
  "/nearby",
  authMiddleware,
  trackingController.getNearbyActiveTrips
);

module.exports = router;
