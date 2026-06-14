const ApiError = require("../../shared/utils/apiError.js");

const buckets = new Map();

const createRateLimiter = ({ windowMs = 60000, max = 60, keyPrefix = "global" } = {}) => {
  return (req, res, next) => {
    const identity = req.user ? req.user.id : req.ip;
    const key = `${keyPrefix}:${identity}`;
    const now = Date.now();
    const bucket = buckets.get(key) || { count: 0, resetAt: now + windowMs };

    if (bucket.resetAt <= now) {
      bucket.count = 0;
      bucket.resetAt = now + windowMs;
    }

    bucket.count += 1;
    buckets.set(key, bucket);

    res.setHeader("X-RateLimit-Limit", String(max));
    res.setHeader("X-RateLimit-Remaining", String(Math.max(max - bucket.count, 0)));
    res.setHeader("X-RateLimit-Reset", String(Math.ceil(bucket.resetAt / 1000)));

    if (bucket.count > max) {
      return next(new ApiError(429, "Too many requests.", "RATE_LIMIT_EXCEEDED"));
    }

    return next();
  };
};

module.exports = {
  createRateLimiter,
  authRateLimiter: createRateLimiter({ windowMs: 15 * 60 * 1000, max: 20, keyPrefix: "auth" }),
  bookingRateLimiter: createRateLimiter({ windowMs: 60 * 1000, max: 30, keyPrefix: "booking" }),
  paymentRateLimiter: createRateLimiter({ windowMs: 60 * 1000, max: 20, keyPrefix: "payment" })
};
