const asyncHandler = require("../../../shared/utils/asyncHandler.js");
const { success } = require("../../../shared/utils/response.js");
const userService = require("../services/user.service.js");
const ApiError = require("../../../shared/utils/apiError.js");

const getMe = asyncHandler(async (req, res) => {
  return success(res, {
    message: "Current user fetched successfully",
    data: {
      user: req.user
    }
  });
});

const getUsers = asyncHandler(async (req, res) => {
  const users = await userService.getAllUsers();
  return success(res, {
    message: "Users fetched successfully",
    data: {
      users
    }
  });
});

const updateUser = asyncHandler(async (req, res) => {
  const { first_name, last_name } = req.body;
  const updatedUser = await userService.updateUser(req.user.id, { first_name, last_name });
  
  return success(res, {
    message: "User updated successfully",
    data: {
      user: updatedUser
    }
  });
});

const updateUserRole = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { role } = req.body;
  
  if (!role) {
    throw new ApiError(400, "Role is required", "BAD_REQUEST");
  }
  
  const updatedUser = await userService.updateRole(userId, role);
  return success(res, {
    message: "User role updated successfully",
    data: {
      user: updatedUser
    }
  });
});

const deleteMe = asyncHandler(async (req, res) => {
  const deletedUser = await userService.deleteUser(req.user.id);
  
  return success(res, {
    message: "User deleted successfully",
    data: {
      user: deletedUser
    }
  });
});

module.exports = {
  getMe,
  getUsers,
  updateUser,
  updateUserRole,
  deleteMe
};
