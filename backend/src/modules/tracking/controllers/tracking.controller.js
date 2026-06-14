const asyncHandler = require("../../../shared/utils/asyncHandler.js");
const { success } = require("../../../shared/utils/response.js");
const trackingService = require("../services/tracking.service.js");

const saveLocation = asyncHandler(async (req, res) => {
  const location = await trackingService.saveLocationUpdate({
    user: req.user,
    tripId: req.body.trip_id,
    latitude: req.body.latitude,
    longitude: req.body.longitude
  });

  return success(res, {
    message: "Location updated successfully",
    data: { location }
  });
});

const getLocationByTripId = asyncHandler(async (req, res) => {
  const location = await trackingService.getLocationByTripId(req.params.trip_id);
  return success(res, {
    message: "Location retrieved successfully",
    data: { location }
  });
});

const getNearbyActiveTrips = asyncHandler(async (req, res) => {
  const trips = await trackingService.getNearbyActiveTrips({
    latitude: req.query.latitude,
    longitude: req.query.longitude,
    radiusKm: req.query.radius_km ? Number(req.query.radius_km) : 20
  });
  return success(res, {
    message: "Nearby active trips retrieved successfully",
    data: { trips }
  });
});

module.exports = {
  saveLocation,
  getLocationByTripId,
  getNearbyActiveTrips
};
