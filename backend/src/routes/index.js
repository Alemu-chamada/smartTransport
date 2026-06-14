const router = require("express").Router();
const authRoutes = require("../modules/auth/routes/auth.routes.js");
const adminRoutes = require("../modules/admin/routes/admin.routes.js");
const profileRoutes = require("../modules/profile/routes/profile.routes.js");
const userRoutes = require("../modules/user/routes/user.routes.js");
const tripRoutes = require("../modules/trip/routes/trip.routes.js");
const bookingRoutes = require("../modules/booking/routes/booking.routes.js");
const paymentRoutes = require("../modules/payment/routes/payment.routes.js");
const trackingRoutes = require("../modules/tracking/routes/tracking.routes.js");
const notificationRoutes = require("../modules/notification/routes/notification.routes.js");
const postRoutes = require("../modules/post/routes/post.routes.js");
const serviceRoutes = require("../modules/service/routes/service.routes.js");

router.use("/auth", authRoutes);
router.use("/admin", adminRoutes);
router.use("/profile", profileRoutes);
router.use("/users", userRoutes);
router.use("/trips", tripRoutes);
router.use("/bookings", bookingRoutes);
router.use("/payment", paymentRoutes);
router.use("/tracking", trackingRoutes);
router.use("/notifications", notificationRoutes);
router.use("/posts", postRoutes);
router.use("/services", serviceRoutes);

module.exports = router;
