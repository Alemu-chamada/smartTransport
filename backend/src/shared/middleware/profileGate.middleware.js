const { USER_ROLES } = require("../../modules/user/constants/user.constants.js");

/**
 * Profile gate — only blocks non-passenger roles with incomplete profiles.
 * Passengers are always allowed through.
 * Never throws — if profile check fails, lets passenger through.
 */
const requireVerifiedProfile = async (req, res, next) => {
  try {
    // No user (unauthenticated) — let auth middleware handle it
    if (!req.user) return next();

    // Passengers always pass — no profile verification needed
    if (req.user.role === USER_ROLES.PASSENGER || req.user.role === 'passenger') {
      return next();
    }

    // For other roles, check profile (best-effort — if DB fails, allow through)
    try {
      const profileService = require("../../modules/profile/services/profile.service.js");
      const profiles = await profileService.getByUserId(req.user.id);
      const profile = Array.isArray(profiles) ? profiles[0] : profiles;

      if (profile && (profile.profile_status === 'COMPLETE' || profile.profile_status === 'VERIFIED')) {
        req.profile = profile;
        return next();
      }

      // Allow system_admin through regardless
      if (req.user.role === USER_ROLES.SYSTEM_ADMIN || req.user.role === 'system_admin') {
        return next();
      }

      // Block other roles with incomplete profile
      return res.status(403).json({
        success: false,
        message: "Please complete your profile before accessing this resource.",
        code: "PROFILE_INCOMPLETE"
      });
    } catch (profileError) {
      // Profile check failed — don't block, let through
      return next();
    }
  } catch (error) {
    return next();
  }
};

module.exports = requireVerifiedProfile;
