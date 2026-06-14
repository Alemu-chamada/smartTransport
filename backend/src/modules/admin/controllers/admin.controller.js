const asyncHandler = require("../../../shared/utils/asyncHandler.js");
const { success } = require("../../../shared/utils/response.js");
const adminService = require("../services/admin.service.js");

const assignUserRole = asyncHandler(async (req, res) => {
  const user = await adminService.assignUserRole({
    actor: req.user,
    targetUserId: req.params.id,
    role: req.body.role
  });

  return success(res, {
    message: "User role updated successfully",
    data: { user }
  });
});

const getMetrics = asyncHandler(async (req, res) => {
  const metrics = await adminService.getMetrics();

  return success(res, {
    message: "System metrics fetched successfully",
    data: { metrics }
  });
});

const getAuditLogs = asyncHandler(async (req, res) => {
  const result = await adminService.getAuditLogs(req.query);

  return success(res, {
    message: "Audit logs fetched successfully",
    data: result
  });
});

const getHealth = asyncHandler(async (req, res) => {
  const health = await adminService.getSystemHealth();

  return success(res, {
    message: "System health fetched successfully",
    data: { health }
  });
});

module.exports = {
  assignUserRole,
  getMetrics,
  getAuditLogs,
  getHealth
};
