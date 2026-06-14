const logger = require("../../shared/utils/logger.js");

const getDuplicateFieldErrors = (error) => {
  if (error.detail) {
    const match = error.detail.match(/\(([^)]+)\)=\(([^)]+)\)/);
    if (match) {
      return [
        {
          field: match[1],
          message: `${match[1]} must be unique.`
        }
      ];
    }
  }

  return [{ message: "Duplicate field value." }];
};

const sendError = (res, { statusCode, message, code, details }) => {
  return res.status(statusCode).json({
    error: message,
    code: code || "INTERNAL_ERROR",
    details: details || null
  });
};

const errorMiddleware = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  if (err.code === 11000 || err.code === "23505") {
    return sendError(res, {
      statusCode: 422,
      message: "Duplicate field value.",
      code: "VALIDATION_ERROR",
      details: getDuplicateFieldErrors(err)
    });
  }

  if (statusCode >= 500) {
    logger.error("Unhandled application error", {
      message: err.message,
      stack: err.stack
    });
  } else {
    logger.warn("Application error", {
      message: err.message,
      code: err.code,
      statusCode,
      method: req.method,
      path: req.originalUrl
    });
  }

  return sendError(res, {
    statusCode,
    message: err.message || "Internal server error",
    code: err.code,
    details: err.errors || null
  });
};

module.exports = errorMiddleware;
