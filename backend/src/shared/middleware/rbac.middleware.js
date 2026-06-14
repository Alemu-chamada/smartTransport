const ApiError = require("../../shared/utils/apiError.js");

const restrictTo = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, "Authentication required.", "UNAUTHORIZED"));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new ApiError(403, "Forbidden.", "FORBIDDEN"));
    }

    return next();
  };
};

module.exports = restrictTo;
