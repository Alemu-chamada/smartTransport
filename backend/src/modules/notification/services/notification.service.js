const db = require("../../../infrastructure/database/db.js");
const logger = require("../../../shared/utils/logger.js");

const createNotification = async ({ userId, title, content }) => {
  const result = await db.query(
    `INSERT INTO notifications (user_id, title, content)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [userId, title, content]
  );
  return result.rows[0];
};

const getNotificationsForUser = async (userId) => {
  const result = await db.query(
    `SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC`,
    [userId]
  );
  return result.rows;
};

const markNotificationAsRead = async (notificationId, userId) => {
  const result = await db.query(
    `UPDATE notifications
     SET is_read = TRUE, updated_at = NOW()
     WHERE id = $1 AND user_id = $2
     RETURNING *`,
    [notificationId, userId]
  );
  return result.rows[0];
};

const sendNotificationToAllUsers = async ({ title, content }) => {
  // Get all users
  const usersResult = await db.query(`SELECT id FROM users`);
  const userIds = usersResult.rows.map((row) => row.id);

  // Create notification for each user
  const notifications = [];
  for (const userId of userIds) {
    const notification = await createNotification({ userId, title, content });
    notifications.push(notification);
  }

  return notifications;
};

const send = async ({ type, recipientUserId, subject, payload }) => {
  logger.info("Notification dispatched", {
    type,
    recipientUserId,
    subject,
    payload
  });

  // Create notification in DB
  await createNotification({
    userId: recipientUserId,
    title: subject,
    content: JSON.stringify(payload)
  });

  return {
    delivered: true,
    provider: "database",
    type,
    recipientUserId
  };
};

const sendBookingConfirmation = ({ userId, bookingId, tripId }) => {
  return send({
    type: "BOOKING_CONFIRMATION",
    recipientUserId: userId,
    subject: "Booking confirmed",
    payload: { booking_id: bookingId, trip_id: tripId }
  });
};

const sendPaymentSuccess = ({ userId, paymentId, bookingId, amount }) => {
  return send({
    type: "PAYMENT_SUCCESS",
    recipientUserId: userId,
    subject: "Payment successful",
    payload: { payment_id: paymentId, booking_id: bookingId, amount }
  });
};

const sendPaymentFailure = ({ userId, paymentId, bookingId }) => {
  return send({
    type: "PAYMENT_FAILURE",
    recipientUserId: userId,
    subject: "Payment failed",
    payload: { payment_id: paymentId, booking_id: bookingId }
  });
};

const sendTripReminder = ({ userId, bookingId, tripId, departureTime }) => {
  return send({
    type: "TRIP_REMINDER",
    recipientUserId: userId,
    subject: "Trip reminder",
    payload: {
      booking_id: bookingId,
      trip_id: tripId,
      departure_time: departureTime
    }
  });
};

module.exports = {
  send,
  sendBookingConfirmation,
  sendPaymentSuccess,
  sendPaymentFailure,
  sendTripReminder,
  createNotification,
  getNotificationsForUser,
  markNotificationAsRead,
  sendNotificationToAllUsers
};
