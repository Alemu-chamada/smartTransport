const success = (res, { statusCode = 200, message = "OK", data = null } = {}) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

const error = (res, { statusCode = 500, message = "Internal server error", code, errors } = {}) => {
  return res.status(statusCode).json({
    success: false,
    message,
    ...(code && { code }),
    ...(errors && { errors })
  });
};

module.exports = {
  success,
  error
};
