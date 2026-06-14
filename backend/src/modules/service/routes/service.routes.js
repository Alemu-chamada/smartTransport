const router = require("express").Router();
const authMiddleware = require("../../../shared/middleware/auth.middleware.js");
const serviceController = require("../controllers/service.controller.js");

router.get("/nearby", authMiddleware, serviceController.getNearbyServices);
router.get("/", authMiddleware, serviceController.getAllServices);

module.exports = router;
