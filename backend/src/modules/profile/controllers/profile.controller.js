const asyncHandler = require("../../../shared/utils/asyncHandler.js");
const { success } = require("../../../shared/utils/response.js");
const profileService = require("../services/profile.service.js");

const getProfile = asyncHandler(async (req, res) => {
  const profile = await profileService.getOrCreateProfile(req.user.id);

  return success(res, {
    message: "Profile fetched successfully",
    data: { profile }
  });
});

const getProfileSchema = asyncHandler(async (req, res) => {
  const schema = await profileService.getRoleProfileSchema(req.user.role);

  return success(res, {
    message: "Profile schema fetched successfully",
    data: { schema }
  });
});

const completeProfile = asyncHandler(async (req, res) => {
  const profile = await profileService.completeProfile({
    user: req.user,
    payload: req.body
  });

  return success(res, {
    message: "Profile submitted successfully",
    data: { profile }
  });
});

module.exports = {
  getProfile,
  getProfileSchema,
  completeProfile
};
