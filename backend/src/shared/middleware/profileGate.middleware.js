const ApiError = require("../../shared/utils/apiError.js");
const profileService = require("../../modules/profile/services/profile.service.js");
const { PROFILE_STATUS } = require("../../modules/profile/constants/profile.constants.js");
const { USER_ROLES } = require("../../modules/user/constants/user.constants.js");

const requireVerifiedProfile = async (req, res, next) => {
  try {
    if (!req.user) {
      throw new ApiError(401, "Authentication required.", "UNAUTHORIZED");
    }

    if (req.user.role === USER_ROLES.PASSENGER) {
      return next();
    }

    const profile = await profileService.getByUserId(req.user.id);

    if (!profile || profile.status !== PROFILE_STATUS.VERIFIED) {
      throw new ApiError(
        403,
        "Profile must be verified before accessing this resource.",
        "PROFILE_INCOMPLETE"
      );
    }

    req.profile = profile;
    return next();
  } catch (error) {
    return next(error);
  }
};

module.exports = requireVerifiedProfile;
