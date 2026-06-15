const dotenv = require("dotenv");

dotenv.config();

const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 3000),
  pg: {
    host: process.env.PGHOST || "localhost",
    port: Number(process.env.PGPORT || 5432),
    database: process.env.PGDATABASE || "neondb",
    user: process.env.PGUSER || "postgres",
    password: process.env.PGPASSWORD || ""
  },
  redisUrl: process.env.REDIS_URL || "redis://localhost:6379",
  jwtSecret: process.env.JWT_SECRET || "change_me_in_production",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1h",
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || "change_me_refresh_in_production",
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  otpExpiresInMinutes: Number(process.env.OTP_EXPIRES_IN_MINUTES || 5),
  bookingReservationMinutes: Number(process.env.BOOKING_RESERVATION_MINUTES || 15),
  paymentWebhookSecret: process.env.PAYMENT_WEBHOOK_SECRET || "change_me_payment_webhook_secret",
  paymentSessionBaseUrl: process.env.PAYMENT_SESSION_BASE_URL || "https://payments.example.test/checkout",
  emailUser: process.env.EMAIL_USER || "",
  emailPass: process.env.EMAIL_PASS || "",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
  allowedOrigins: process.env.ALLOWED_ORIGINS || "http://localhost:5173",
  sessionSecret: process.env.SESSION_SECRET || "change_me_session_secret_in_production"
};

// Production validation
if (env.nodeEnv === "production") {
  if (env.jwtSecret === "change_me_in_production") {
    throw new Error("JWT_SECRET must be configured in production.");
  }
  if (env.jwtRefreshSecret === "change_me_refresh_in_production") {
    throw new Error("JWT_REFRESH_SECRET must be configured in production.");
  }
  if (env.sessionSecret === "change_me_session_secret_in_production") {
    throw new Error("SESSION_SECRET must be configured in production.");
  }
  if (!env.pg.password) {
    throw new Error("Database password (PGPASSWORD) must be configured in production.");
  }
}

module.exports = env;
