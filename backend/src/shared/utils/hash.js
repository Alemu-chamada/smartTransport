const bcrypt = require("bcryptjs");

const hashValue = async (value) => {
  return bcrypt.hash(value, 12);
};

const compareHash = async (value, hashedValue) => {
  return bcrypt.compare(value, hashedValue);
};

module.exports = {
  hashValue,
  compareHash
};
