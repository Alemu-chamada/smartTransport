const Redis = require("ioredis");
const env = require("../../config/env.js");
const logger = require("../../shared/utils/logger.js");

// Make Redis optional - won't crash if connection fails
let redis;

try {
  redis = new Redis(env.redisUrl, {
    maxRetriesPerRequest: 2,
    enableReadyCheck: true,
    retryStrategy: (times) => {
      // Stop retrying after 3 attempts
      if (times > 3) {
        logger.warn("Redis connection failed after 3 attempts. Continuing without Redis.");
        return null; // Stop retrying
      }
      return Math.min(times * 100, 3000);
    }
  });

  redis.on("connect", () => {
    logger.info("Redis connected");
  });

  redis.on("error", (error) => {
    logger.warn("Redis connection error (app will continue without Redis)", { message: error.message });
  });
} catch (error) {
  logger.warn("Redis initialization failed. App will run without Redis cache.", { error: error.message });
  // Create a mock redis client that does nothing
  redis = {
    get: async () => null,
    set: async () => 'OK',
    del: async () => 1,
    setex: async () => 'OK',
    expire: async () => 1,
    exists: async () => 0,
    ping: async () => 'PONG'
  };
}

module.exports = redis;
