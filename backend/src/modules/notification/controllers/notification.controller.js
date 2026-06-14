const asyncHandler = require("../../../shared/utils/asyncHandler.js");
const { success } = require("../../../shared/utils/response.js");
const notificationService = require("../services/notification.service.js");

const sendTripReminder = asyncHandler(async (req, res) => {
  const result = await notificationService.sendTripReminder({
    userId: req.body.user_id,
    bookingId: req.body.booking_id,
    tripId: req.body.trip_id,
    departureTime: req.body.departure_time
  });

  return success(res, {
    message: "Trip reminder notification dispatched",
    data: { notification: result }
  });
});

const getMyNotifications = asyncHandler(async (req, res) => {
  const notifications = await notificationService.getNotificationsForUser(req.user.id);
  return success(res, {
    message: "Notifications retrieved successfully",
    data: { notifications }
  });
});

const markAsRead = asyncHandler(async (req, res) => {
  const notification = await notificationService.markNotificationAsRead(
    req.params.id,
    req.user.id
  );
  return success(res, {
    message: "Notification marked as read",
    data: { notification }
  });
});

const sendToAllUsers = asyncHandler(async (req, res) => {
  const notifications = await notificationService.sendNotificationToAllUsers({
    title: req.body.title,
    content: req.body.content
  });
  return success(res, {
    message: "Notifications sent to all users",
    data: { notifications }
  });
});

module.exports = {
  sendTripReminder,
  getMyNotifications,
  markAsRead,
  sendToAllUsers
};
