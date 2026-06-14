const asyncHandler = require("../../../shared/utils/asyncHandler.js");
const { success } = require("../../../shared/utils/response.js");
const serviceService = require("../services/service.service.js");

const getNearbyServices = asyncHandler(async (req, res) => {
  const services = await serviceService.getNearbyServices({
    latitude: req.query.latitude,
    longitude: req.query.longitude,
    radiusKm: req.query.radius_km ? Number(req.query.radius_km) : 10,
    type: req.query.type
  });
  return success(res, {
    message: "Nearby services retrieved successfully",
    data: { services }
  });
});

const getAllServices = asyncHandler(async (req, res) => {
  const services = await serviceService.getAllServices();
  return success(res, {
    message: "Services retrieved successfully",
    data: { services }
  });
});

module.exports = {
  getNearbyServices,
  getAllServices
};
