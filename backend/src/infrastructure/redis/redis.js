const Redis = require("ioredis");
const env = require("../../config/env.js");
const logger = require("../../shared/utils/logger.js");

const redis = new Redis(env.redisUrl, {
  maxRetriesPerRequest: 2,
  enableReadyCheck: true
});

redis.on("connect", () => {
  logger.info("Redis connected");
});

redis.on("error", (error) => {
  logger.error("Redis connection error", { message: error.message });
});

module.exports = redis;
