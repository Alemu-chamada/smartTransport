const router = require("express").Router();
const authMiddleware = require("../../../shared/middleware/auth.middleware.js");
const restrictTo = require("../../../shared/middleware/rbac.middleware.js");
const notificationController = require("../controllers/notification.controller.js");
const { USER_ROLES } = require("../../user/constants/user.constants.js");

router.get("/my", authMiddleware, notificationController.getMyNotifications);
router.patch("/:id/read", authMiddleware, notificationController.markAsRead);
router.post(
  "/send-to-all",
  authMiddleware,
  restrictTo(USER_ROLES.SYSTEM_ADMIN),
  notificationController.sendToAllUsers
);
router.post(
  "/trip-reminder",
  authMiddleware,
  restrictTo(USER_ROLES.SYSTEM_ADMIN),
  notificationController.sendTripReminder
);

module.exports = router;
