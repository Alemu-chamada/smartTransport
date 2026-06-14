const db = require("../../../infrastructure/database/db.js");
const ApiError = require("../../../shared/utils/apiError.js");
const auditService = require("../../audit/services/audit.service.js");
const bookingService = require("../../booking/services/booking.service.js");
const { mapPayment } = require("../repositories/payment.model.js");
const { mapTrip } = require("../../trip/repositories/trip.model.js");

const getPaymentByBookingId = async (bookingId, client = db) => {
  const result = await client.query(
    "SELECT * FROM payments WHERE booking_id = $1",
    [bookingId]
  );
  return mapPayment(result.rows[0]);
};

const getPaymentById = async (paymentId, client = db) => {
  const result = await client.query(
    "SELECT * FROM payments WHERE id = $1",
    [paymentId]
  );
  return mapPayment(result.rows[0]);
};

const getTripById = async (tripId, client = db) => {
  const result = await client.query(
    "SELECT * FROM trips WHERE id = $1",
    [tripId]
  );
  return mapTrip(result.rows[0]);
};

const createPaymentSession = async ({ user, bookingId }) => {
  if (!bookingId) {
    throw new ApiError(422, "Booking ID is required.", "VALIDATION_ERROR");
  }

  await bookingService.releaseExpiredBookings();

  return db.transaction(async (client) => {
    const booking = await bookingService.getBookingById(bookingId, client);
    if (!booking) {
      throw new ApiError(404, "Booking not found.", "BOOKING_NOT_FOUND");
    }

    if (booking.passenger_id !== user.id) {
      throw new ApiError(403, "Only the booking owner can create payment.", "FORBIDDEN");
    }

    if (booking.status !== 'reserved') {
      throw new ApiError(422, "Only reserved bookings can create payment sessions.", "INVALID_STATE");
    }

    const trip = await getTripById(booking.trip_id, client);
    if (!trip) {
      throw new ApiError(404, "Trip for booking not found.", "TRIP_NOT_FOUND");
    }

    const existingPayment = await getPaymentByBookingId(bookingId, client);
    if (existingPayment) {
      throw new ApiError(422, "Payment already exists for this booking.", "PAYMENT_EXISTS");
    }

    // First update booking to payment_pending
    await client.query(
      `
      UPDATE bookings
      SET status = $2,
          updated_at = now()
      WHERE id = $1
      `,
      [bookingId, 'payment_pending']
    );

    // Create payment record
    const paymentResult = await client.query(
      `
      INSERT INTO payments (booking_id, idempotency_key, amount, currency, gateway_name, gateway_status)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
      `,
      [
        bookingId,
        `${Date.now()}-${bookingId}`,
        trip.fare,
        trip.currency,
        'mock',
        'pending'
      ]
    );

    const payment = mapPayment(paymentResult.rows[0]);

    await auditService.log({
      actorId: user.id,
      targetUserId: user.id,
      action: auditService.AUDIT_ACTIONS.PAYMENT_CREATED,
      metadata: {
        payment_id: payment.id,
        booking_id: bookingId
      }
    }, client);

    return {
      payment,
      payment_url: `/payments/${payment.id}/mock`
    };
  });
};

const handleWebhook = async ({ payload }) => {
  const { booking_id, status, gateway_txn_id, webhook_event_id, amount, currency } = payload;

  if (!booking_id || !status) {
    throw new ApiError(422, "Booking ID and status are required.", "VALIDATION_ERROR");
  }

  return db.transaction(async (client) => {
    const booking = await bookingService.getBookingById(booking_id, client);
    if (!booking) {
      throw new ApiError(404, "Booking not found.", "BOOKING_NOT_FOUND");
    }

    let payment = await getPaymentByBookingId(booking_id, client);
    if (!payment) {
      throw new ApiError(404, "Payment not found for booking.", "PAYMENT_NOT_FOUND");
    }

    if (status === 'success') {
      // Update booking to confirmed
      await client.query(
        `
        UPDATE bookings
        SET status = $2,
            updated_at = now()
        WHERE id = $1
        `,
        [booking_id, 'confirmed']
      );

      // Update payment
      const paymentResult = await client.query(
        `
        UPDATE payments
        SET gateway_status = $2,
            gateway_txn_id = $3,
            webhook_event_id = $4,
            amount = $5,
            currency = $6,
            updated_at = now()
        WHERE id = $1
        RETURNING *
        `,
        [payment.id, 'success', gateway_txn_id, webhook_event_id, amount || 0, currency || 'ETB']
      );
      payment = mapPayment(paymentResult.rows[0]);

      await auditService.log({
        actorId: booking.passenger_id,
        targetUserId: booking.passenger_id,
        action: auditService.AUDIT_ACTIONS.PAYMENT_SUCCESS,
        metadata: {
          payment_id: payment.id,
          booking_id: booking_id
        }
      }, client);
    } else if (status === 'failed') {
      // Update booking to failed
      await client.query(
        `
        UPDATE bookings
        SET status = $2,
            updated_at = now()
        WHERE id = $1
        `,
        [booking_id, 'failed']
      );

      // Update payment
      const paymentResult = await client.query(
        `
        UPDATE payments
        SET gateway_status = $2,
            gateway_txn_id = $3,
            webhook_event_id = $4,
            updated_at = now()
        WHERE id = $1
        RETURNING *
        `,
        [payment.id, 'failed', gateway_txn_id, webhook_event_id]
      );
      payment = mapPayment(paymentResult.rows[0]);

      await auditService.log({
        actorId: booking.passenger_id,
        targetUserId: booking.passenger_id,
        action: auditService.AUDIT_ACTIONS.PAYMENT_FAILURE,
        metadata: {
          payment_id: payment.id,
          booking_id: booking_id
        }
      }, client);
    }

    return { payment, alreadyProcessed: false };
  });
};

module.exports = {
  createPaymentSession,
  handleWebhook,
  getPaymentByBookingId,
  getPaymentById
};
