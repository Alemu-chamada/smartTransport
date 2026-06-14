const jwt = require("jsonwebtoken");
const env = require("../../config/env.js");

const signAccessToken = (user) => {
  return jwt.sign(
    {
      sub: user.id,
      role: user.role,
      profile_completion_required: user.profileCompletionRequired || false
    },
    env.jwtSecret,
    {
      expiresIn: env.jwtExpiresIn
    }
  );
};

const verifyAccessToken = (token) => {
  return jwt.verify(token, env.jwtSecret);
};

module.exports = {
  signAccessToken,
  verifyAccessToken
};
