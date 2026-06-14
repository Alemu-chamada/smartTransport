const crypto = require("crypto");
const redis = require("../../infrastructure/redis/redis.js");
const ApiError = require("./apiError.js");

const releaseLockScript = `
if redis.call("GET", KEYS[1]) == ARGV[1] then
  return redis.call("DEL", KEYS[1])
end
return 0
`;

const acquireLock = async (key, ttlMs = 10000) => {
  const token = crypto.randomUUID();
  const acquired = await redis.set(key, token, "PX", ttlMs, "NX");

  if (acquired !== "OK") {
    throw new ApiError(409, "Seat is currently being reserved. Try again.", "SEAT_LOCKED");
  }

  return {
    key,
    token,
    release: async () => {
      await redis.eval(releaseLockScript, 1, key, token);
    }
  };
};

module.exports = {
  acquireLock
};
