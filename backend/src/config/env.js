const dotenv = require("dotenv");

dotenv.config();

const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 3000),
  pg: {
    host: process.env.PGHOST || "localhost",
    port: Number(process.env.PGPORT || 5000),
    database: process.env.PGDATABASE || "TMSDB",
    user: process.env.PGUSER || "postgres",
    password: process.env.PGPASSWORD || "Ale@0992738116"
  },
  redisUrl: process.env.REDIS_URL || "redis://localhost:6379",
  jwtSecret: process.env.JWT_SECRET || "change_me_in_production",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1h",
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || "change_me_refresh_in_production",
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  otpExpiresInMinutes: Number(process.env.OTP_EXPIRES_IN_MINUTES || 10),
  bookingReservationMinutes: Number(process.env.BOOKING_RESERVATION_MINUTES || 15),
  paymentWebhookSecret: process.env.PAYMENT_WEBHOOK_SECRET || "change_me_payment_webhook_secret",
  paymentSessionBaseUrl: process.env.PAYMENT_SESSION_BASE_URL || "https://payments.example.test/checkout"
};

if (env.nodeEnv === "production" && env.jwtSecret === "change_me_in_production") {
  throw new Error("JWT_SECRET must be configured in production.");
}

module.exports = env;
