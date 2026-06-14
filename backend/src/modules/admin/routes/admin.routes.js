const router = require("express").Router();
const authMiddleware = require("../../../shared/middleware/auth.middleware.js");
const restrictTo = require("../../../shared/middleware/rbac.middleware.js");
const adminController = require("../controllers/admin.controller.js");
const { USER_ROLES } = require("../../user/constants/user.constants.js");

router.use(authMiddleware, restrictTo(USER_ROLES.SYSTEM_ADMIN));

router.get("/metrics", adminController.getMetrics);
router.get("/audit-logs", adminController.getAuditLogs);
router.get("/health", adminController.getHealth);

router.patch(
  "/users/:id/role",
  adminController.assignUserRole
);

module.exports = router;
