const asyncHandler = require("../../../shared/utils/asyncHandler.js");
const { success } = require("../../../shared/utils/response.js");
const tripService = require("../services/trip.service.js");

const createTrip = asyncHandler(async (req, res) => {
  const result = await tripService.createTrip({
    actor: req.user,
    payload: req.body
  });

  return success(res, {
    statusCode: 201,
    message: "Trip created successfully",
    data: result
  });
});

const getScheduledTrips = asyncHandler(async (req, res) => {
  const trips = await tripService.getScheduledTrips();

  return success(res, {
    message: "Scheduled trips fetched successfully",
    data: { trips }
  });
});

const getNearbyTrips = asyncHandler(async (req, res) => {
  const trips = await tripService.getNearbyTrips(req.query);

  return success(res, {
    message: "Nearby trips fetched successfully",
    data: { trips }
  });
});

const getTripById = asyncHandler(async (req, res) => {
  const trip = await tripService.getTripById(req.params.id);

  return success(res, {
    message: "Trip fetched successfully",
    data: { trip }
  });
});

const getTripOccupiedSeats = asyncHandler(async (req, res) => {
  const occupiedSeats = await tripService.getTripOccupiedSeats(req.params.id);
  return success(res, {
    message: "Occupied seats fetched successfully",
    data: { occupiedSeats }
  });
});

const deleteTrip = asyncHandler(async (req, res) => {
  await tripService.deleteTrip({ actor: req.user, tripId: req.params.id });
  return success(res, { message: "Trip deleted successfully", data: { deleted: true } });
});

const updateTrip = asyncHandler(async (req, res) => {
  const result = await tripService.updateTrip({ actor: req.user, tripId: req.params.id, payload: req.body });
  return success(res, { message: "Trip updated successfully", data: result });
});

module.exports = {
  createTrip,
  getScheduledTrips,
  getNearbyTrips,
  getTripById,
  getTripOccupiedSeats,
  deleteTrip,
  updateTrip,
};
