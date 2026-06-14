const router = require("express").Router();
const authMiddleware = require("../../../shared/middleware/auth.middleware.js");
const restrictTo = require("../../../shared/middleware/rbac.middleware.js");
const tripController = require("../controllers/trip.controller.js");
const { USER_ROLES } = require("../../user/constants/user.constants.js");

router.post(
  "/",
  authMiddleware,
  restrictTo(USER_ROLES.SYSTEM_ADMIN),
  tripController.createTrip
);

router.get("/scheduled", tripController.getScheduledTrips);
router.get("/nearby", tripController.getNearbyTrips);
router.get("/:id", tripController.getTripById);
router.get("/:id/occupied-seats", tripController.getTripOccupiedSeats);

module.exports = router;
