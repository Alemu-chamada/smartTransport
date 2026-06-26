const http = require("http");
const app = require("./app.js");
const { connectDb } = require("./infrastructure/database/db.js");
const env = require("./config/env.js");
const logger = require("./shared/utils/logger.js");
const { initializeTrackingSocket } = require("./infrastructure/socket/tracking.socket.js");

// ---------------------------------------------------------------------------
// Startup environment check — warn loudly about missing critical vars
// ---------------------------------------------------------------------------
const checkEnv = () => {
  const warnings = [];

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    warnings.push("⚠️  EMAIL_USER or EMAIL_PASS is not set — OTP email delivery will fail.");
  }
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET === "change_me_in_production") {
    warnings.push("⚠️  JWT_SECRET is not set or is using the default — authentication is insecure.");
  }
  if (!process.env.DATABASE_URL && !process.env.PGPASSWORD) {
    warnings.push("⚠️  Neither DATABASE_URL nor PGPASSWORD is set — database connection may fail.");
  }
  if (!process.env.REDIS_URL || process.env.REDIS_URL.includes("localhost")) {
    warnings.push("⚠️  REDIS_URL points to localhost — Redis will be disabled in production.");
  }
  if (!process.env.FRONTEND_URL) {
    warnings.push("⚠️  FRONTEND_URL is not set — CORS may block frontend requests.");
  }

  if (warnings.length > 0) {
    console.warn("\n════════════════════════════════════════");
    console.warn("  MISSING / INSECURE ENVIRONMENT VARIABLES");
    warnings.forEach((w) => console.warn(" ", w));
    console.warn("════════════════════════════════════════\n");
  }
};

// ---------------------------------------------------------------------------
// Start the server
// ---------------------------------------------------------------------------
const start = async () => {
  try {
    checkEnv();
    await connectDb();

    const server = http.createServer(app);
    initializeTrackingSocket(server);

    server.listen(env.port, () => {
      logger.info(`Server is running on port ${env.port}`);
    });

    // Graceful shutdown
    const shutdown = async (signal) => {
      logger.info(`${signal} received — shutting down gracefully`);
      server.close(() => {
        logger.info("HTTP server closed");
        process.exit(0);
      });
      setTimeout(() => process.exit(1), 10000); // Force exit after 10s
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT",  () => shutdown("SIGINT"));

  } catch (error) {
    logger.error(`Server failed to start: ${error.message}`);
    process.exit(1);
  }
};

start();
