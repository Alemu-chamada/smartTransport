const router = require("express").Router();
const authMiddleware = require("../../../shared/middleware/auth.middleware.js");
const profileController = require("../controllers/profile.controller.js");

router.get("/schema", authMiddleware, profileController.getProfileSchema);
router.patch("/complete", authMiddleware, profileController.completeProfile);
router.get("/", authMiddleware, profileController.getProfile);

module.exports = router;
