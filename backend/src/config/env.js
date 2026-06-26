const dotenv = require("dotenv");

dotenv.config();

const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 5002),

  pg: {
    // Prefer full connection string (Neon); fallback to individual vars
    databaseUrl:  process.env.DATABASE_URL || "",
    host:         process.env.PGHOST     || "localhost",
    port:         Number(process.env.PGPORT || 5432),
    database:     process.env.PGDATABASE || "TMSDB",
    user:         process.env.PGUSER     || "postgres",
    password:     process.env.PGPASSWORD || "",
  },

  redisUrl: process.env.REDIS_URL || "redis://localhost:6379",

  jwtSecret:           process.env.JWT_SECRET            || "change_me_in_production",
  jwtExpiresIn:        process.env.JWT_EXPIRES_IN         || "1h",
  jwtRefreshSecret:    process.env.JWT_REFRESH_SECRET     || "change_me_refresh_in_production",
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",

  otpExpiresInMinutes:       Number(process.env.OTP_EXPIRES_IN_MINUTES     || 5),
  bookingReservationMinutes: Number(process.env.BOOKING_RESERVATION_MINUTES || 15),

  paymentWebhookSecret: process.env.PAYMENT_WEBHOOK_SECRET  || "change_me_payment_webhook_secret",
  paymentSessionBaseUrl: process.env.PAYMENT_SESSION_BASE_URL || "https://payments.example.test/checkout",

  // Email OTP (Nodemailer / Gmail)
  emailUser: process.env.EMAIL_USER || "",
  emailPass: process.env.EMAIL_PASS || "",

  // CORS
  frontendUrl:    process.env.FRONTEND_URL    || "http://localhost:5173",
  allowedOrigins: process.env.ALLOWED_ORIGINS || "http://localhost:5173",

  sessionSecret: process.env.SESSION_SECRET || "change_me_session_secret_in_production",
};

// ---------------------------------------------------------------------------
// Production guard — crash early if required secrets are missing
// ---------------------------------------------------------------------------
if (env.nodeEnv === "production") {
  const required = {
    JWT_SECRET:         env.jwtSecret,
    JWT_REFRESH_SECRET: env.jwtRefreshSecret,
    SESSION_SECRET:     env.sessionSecret,
    PGPASSWORD:         env.pg.password || env.pg.databaseUrl,
    EMAIL_USER:         env.emailUser,
    EMAIL_PASS:         env.emailPass,
  };

  for (const [name, value] of Object.entries(required)) {
    if (!value || value.startsWith("change_me")) {
      throw new Error(`❌  ${name} must be set in production.`);
    }
  }
}

module.exports = env;
