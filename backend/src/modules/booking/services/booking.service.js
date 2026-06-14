const env = require("../../../config/env.js");
const db = require("../../../infrastructure/database/db.js");
const ApiError = require("../../../shared/utils/apiError.js");
const auditService = require("../../audit/services/audit.service.js");
const tripService = require("../../trip/services/trip.service.js");
const { mapBooking } = require("../repositories/booking.model.js");

const getReservationExpiry = () => {
  return new Date(Date.now() + env.bookingReservationMinutes * 60 * 1000);
};

const releaseExpiredBookings = async () => {
  return db.transaction(async (client) => {
    const expiredResult = await client.query(
      `
      SELECT id
      FROM bookings
      WHERE status IN ($1, $2)
        AND expires_at <= now()
      FOR UPDATE
      `,
      ['reserved', 'payment_pending']
    );

    for (const booking of expiredResult.rows) {
      await client.query(
        `
        UPDATE bookings
        SET status = $2,
            updated_at = now()
        WHERE id = $1
        `,
        [booking.id, 'expired']
      );
    }
  });
};

const validateCreateBookingPayload = ({ trip_id, seat_number, idempotency_key }) => {
  if (!trip_id) {
    throw new ApiError(422, "Trip ID is required.", "VALIDATION_ERROR");
  }
  if (!seat_number || seat_number < 1) {
    throw new ApiError(422, "Valid seat number is required.", "VALIDATION_ERROR");
  }
  if (!idempotency_key) {
    throw new ApiError(422, "Idempotency key is required.", "VALIDATION_ERROR");
  }
};

const getBookingById = async (bookingId, client = db) => {
  const result = await client.query(
    "SELECT * FROM bookings WHERE id = $1",
    [bookingId]
  );
  return mapBooking(result.rows[0]);
};

const getBookingWithRelations = async (bookingId, client = db) => {
  const result = await client.query(
    `
    SELECT b.*,
           to_jsonb(t.*) AS trip
    FROM bookings b
    JOIN trips t ON t.id = b.trip_id
    WHERE b.id = $1
    `,
    [bookingId]
  );
  return mapBooking(result.rows[0]);
};

const createBooking = async ({ user, payload }) => {
  validateCreateBookingPayload(payload);
  await releaseExpiredBookings();

  return db.transaction(async (client) => {
    const trip = await tripService.findScheduledTripById(payload.trip_id, client);
    if (!trip) {
      throw new ApiError(404, "Scheduled trip not found.", "TRIP_NOT_FOUND");
    }

    if (payload.seat_number > trip.total_capacity) {
      throw new ApiError(422, "Seat number exceeds trip capacity.", "INVALID_SEAT");
    }

    // Check existing booking with same idempotency key
    const existingResult = await client.query(
      "SELECT * FROM bookings WHERE idempotency_key = $1",
      [payload.idempotency_key]
    );
    if (existingResult.rows[0]) {
      return mapBooking(existingResult.rows[0]);
    }

    const bookingResult = await client.query(
      `
      INSERT INTO bookings (passenger_id, trip_id, seat_number, status, expires_at, idempotency_key)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
      `,
      [
        user.id,
        trip.id,
        payload.seat_number,
        'reserved',
        getReservationExpiry(),
        payload.idempotency_key
      ]
    );

    const booking = mapBooking(bookingResult.rows[0]);

    await auditService.log({
      actorId: user.id,
      targetUserId: user.id,
      action: auditService.AUDIT_ACTIONS.BOOKING_CREATED,
      metadata: {
        booking_id: booking.id,
        trip_id: trip.id,
        seat_number: payload.seat_number
      }
    }, client);

    return booking;
  });
};

const getMyBookings = async (user) => {
  await releaseExpiredBookings();
  const result = await db.query(
    `
    SELECT b.*,
           to_jsonb(t.*) AS trip
    FROM bookings b
    JOIN trips t ON t.id = b.trip_id
    WHERE b.passenger_id = $1
    ORDER BY b.created_at DESC
    `,
    [user.id]
  );
  return result.rows.map(mapBooking);
};

const cancelBooking = async ({ user, bookingId }) => {
  await releaseExpiredBookings();
  return db.transaction(async (client) => {
    const booking = await getBookingById(bookingId, client);
    if (!booking) {
      throw new ApiError(404, "Booking not found.", "BOOKING_NOT_FOUND");
    }
    if (booking.passenger_id !== user.id) {
      throw new ApiError(403, "Only the booking owner can cancel this booking.", "FORBIDDEN");
    }
    if (booking.status === 'confirmed') {
      throw new ApiError(403, "Confirmed bookings cannot be canceled.", "FORBIDDEN");
    }
    if (!['reserved', 'payment_pending'].includes(booking.status)) {
      throw new ApiError(422, "Booking cannot be canceled in its current state.", "INVALID_STATE");
    }
    await client.query(
      `
      UPDATE bookings
      SET status = $2,
          updated_at = now()
      WHERE id = $1
      `,
      [bookingId, 'failed']
    );
    await auditService.log({
      actorId: user.id,
      targetUserId: user.id,
      action: auditService.AUDIT_ACTIONS.BOOKING_CANCELED,
      metadata: {
        booking_id: bookingId,
        trip_id: booking.trip_id
      }
    }, client);
    return getBookingById(bookingId, client);
  });
};

module.exports = {
  createBooking,
  getMyBookings,
  cancelBooking,
  releaseExpiredBookings,
  getBookingById,
  getBookingWithRelations
};
