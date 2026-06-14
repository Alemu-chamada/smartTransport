const router = require("express").Router();
const authController = require("../controllers/auth.controller.js");
const authMiddleware = require("../../../shared/middleware/auth.middleware.js");
const { authRateLimiter } = require("../../../shared/middleware/rateLimit.middleware.js");

router.post("/register", authRateLimiter, authController.register);
router.post("/login", authRateLimiter, authController.login);
router.post("/verify-otp", authRateLimiter, authController.verifyOtp);
router.post("/change-email/send-otp", authMiddleware, authRateLimiter, authController.sendChangeEmailOtp);
router.post("/change-phone/send-otp", authMiddleware, authRateLimiter, authController.sendChangePhoneOtp);
router.post("/change-password/send-otp", authMiddleware, authRateLimiter, authController.sendChangePasswordOtp);
router.post("/logout", authMiddleware, authController.logout);
router.get("/me", authMiddleware, authController.me);

module.exports = router;
