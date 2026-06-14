const redact = (value) => {
  if (!value || typeof value !== "object") return value;

  const sensitiveKeys = ["password", "token", "authorization", "otp", "secret", "signature"];
  const copy = Array.isArray(value) ? [...value] : { ...value };

  for (const key of Object.keys(copy)) {
    if (sensitiveKeys.some((sensitiveKey) => key.toLowerCase().includes(sensitiveKey))) {
      copy[key] = "[REDACTED]";
    } else if (copy[key] && typeof copy[key] === "object") {
      copy[key] = redact(copy[key]);
    }
  }

  return copy;
};

const format = (level, message, meta) => {
  const payload = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...(meta && { meta: redact(meta) })
  };

  return JSON.stringify(payload);
};

const logger = {
  info(message, meta) {
    console.info(format("info", message, meta));
  },
  warn(message, meta) {
    console.warn(format("warn", message, meta));
  },
  error(message, meta) {
    console.error(format("error", message, meta));
  }
};

const requestLogger = (req, res, next) => {
  const startedAt = Date.now();

  res.on("finish", () => {
    logger.info("HTTP request completed", {
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: Date.now() - startedAt,
      ip: req.ip,
      userId: req.user ? req.user.id : undefined
    });
  });

  next();
};

module.exports = {
  ...logger,
  requestLogger,
  redact
};
