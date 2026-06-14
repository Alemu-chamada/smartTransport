const ApiError = require("../../shared/utils/apiError.js");
const { verifyAccessToken } = require("../../shared/utils/jwt.js");
const userService = require("../../modules/user/services/user.service.js");

const authMiddleware = async (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const [scheme, token] = header.split(" ");

    if (scheme !== "Bearer" || !token) {
      throw new ApiError(401, "Authentication required.", "UNAUTHORIZED");
    }

    const payload = verifyAccessToken(token);
    const user = await userService.findById(payload.sub);

    if (!user) {
      throw new ApiError(401, "Authentication required.", "UNAUTHORIZED");
    }

    req.user = user;
    return next();
  } catch (error) {
    if (error instanceof ApiError) return next(error);
    return next(new ApiError(401, "Invalid or expired token.", "UNAUTHORIZED"));
  }
};

module.exports = authMiddleware;
