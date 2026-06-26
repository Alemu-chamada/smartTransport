const Stripe = require("stripe");
const db = require("../../../infrastructure/database/db.js");
const ApiError = require("../../../shared/utils/apiError.js");
const auditService = require("../../audit/services/audit.service.js");
const bookingService = require("../../booking/services/booking.service.js");
const { mapPayment } = require("../repositories/payment.model.js");
const { mapTrip } = require("../../trip/repositories/trip.model.js");
const env = require("../../../config/env.js");
const logger = require("../../../shared/utils/logger.js");

// Lazy Stripe — returns null if key missing/invalid
let _stripe = null;
const getStripe = () => {
  if (_stripe) return _stripe;
  if (!env.stripeSecretKey) return null;
  try {
    _stripe = new Stripe(env.stripeSecretKey, { apiVersion: "2024-12-18.acacia" });
    return _stripe;
  } catch { return null; }
};

const getPaymentByBookingId = async (bookingId, client = db) => {
  const result = await client.query("SELECT * FROM payments WHERE booking_id = $1", [bookingId]);
  return mapPayment(result.rows[0]);
};

const getPaymentById = async (paymentId, client = db) => {
  const result = await client.query("SELECT * FROM payments WHERE id = $1", [paymentId]);
  return mapPayment(result.rows[0]);
};

const getTripById = async (tripId, client = db) => {
  const result = await client.query("SELECT * FROM trips WHERE id = $1", [tripId]);
  return mapTrip(result.rows[0]);
};

/**
 * Create payment session.
 * Uses Stripe if key is valid, falls back to simulated payment for demos.
 */
const createPaymentSession = async ({ user, bookingId }) => {
  if (!bookingId) throw new ApiError(422, "Booking ID is required.", "VALIDATION_ERROR");

  await bookingService.releaseExpiredBookings();

  const result = await db.transaction(async (client) => {
    const booking = await bookingService.getBookingById(bookingId, client);
    if (!booking) throw new ApiError(404, "Booking not found.", "BOOKING_NOT_FOUND");
    if (booking.passenger_id !== user.id) throw new ApiError(403, "Only the booking owner can create payment.", "FORBIDDEN");
    if (booking.status !== "reserved") throw new ApiError(422, "Only reserved bookings can initiate payment.", "INVALID_STATE");

    const trip = await getTripById(booking.trip_id, client);
    if (!trip) throw new ApiError(404, "Trip not found.", "TRIP_NOT_FOUND");

    // Return existing payment
    const existing = await getPaymentByBookingId(bookingId, client);
    if (existing) {
      logger.info("Returning existing payment session", { bookingId });
      try {
        const stripe = getStripe();
        if (stripe && existing.idempotency_key && !existing.idempotency_key.startsWith("sim_")) {
          const pi = await stripe.paymentIntents.retrieve(existing.idempotency_key);
          return { payment: existing, client_secret: pi.client_secret, publishable_key: env.stripePublishableKey, mode: "stripe" };
        }
      } catch {}
      return {
        payment: existing,
        client_secret: existing.gateway_txn_id || `sim_secret_${existing.id}`,
        publishable_key: env.stripePublishableKey || "",
        mode: "simulated"
      };
    }

    const amountInCents = Math.max(Math.round(Number(trip.fare) * 100), 50);
    let piId = null;
    let clientSecret = null;
    let mode = "simulated";

    // Try Stripe
    const stripe = getStripe();
    if (stripe) {
      try {
        const pi = await stripe.paymentIntents.create({
          amount: amountInCents,
          currency: "usd",
          // Explicitly use card only — avoids redirect-based payment methods
          // that conflict with the in-page PaymentElement
          payment_method_types: ["card"],
          metadata: {
            booking_id: bookingId,
            trip_id: trip.id,
            passenger_id: user.id,
            seat_number: String(booking.seat_number),
          },
          description: `SmartTransport: ${trip.origin} -> ${trip.destination} | Seat ${booking.seat_number}`,
        });
        piId = pi.id;
        clientSecret = pi.client_secret;
        mode = "stripe";
        logger.info("Stripe PaymentIntent created", { bookingId, piId });
      } catch (e) {
        logger.warn("Stripe failed, using simulated payment", { error: e.message });
      }
    }

    // Simulated fallback
    if (!piId) {
      piId = `sim_pi_${Date.now()}_${bookingId.substring(0, 8)}`;
      clientSecret = `sim_secret_${piId}`;
      logger.info("Using simulated payment", { bookingId, simId: piId });
    }

    // Move to payment_pending
    await client.query(`UPDATE bookings SET status = 'payment_pending', updated_at = now() WHERE id = $1`, [bookingId]);

    // Store payment
    const paymentResult = await client.query(
      `INSERT INTO payments (booking_id, idempotency_key, amount, currency, gateway_name, gateway_status, gateway_txn_id, webhook_event_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [bookingId, piId, trip.fare, trip.currency, "stripe", "pending", clientSecret, piId]
    );

    return { payment: mapPayment(paymentResult.rows[0]), client_secret: clientSecret, publishable_key: env.stripePublishableKey || "", mode };
  });

  // Audit outside transaction
  try {
    await auditService.log({
      actorId: user.id, action: auditService.AUDIT_ACTIONS.PAYMENT_SESSION_CREATED,
      entityType: "payment", entityId: result.payment?.id,
      metadata: { booking_id: bookingId, mode: result.mode }
    });
  } catch (e) { logger.warn("Audit failed", { error: e.message }); }

  return result;
};

/**
 * Handle Stripe webhook events.
 * Also handles simulated payments from frontend.
 */
const handleStripeWebhook = async ({ rawBody, signature }) => {
  // Simulated payment webhook (no signature needed)
  let payload;
  try { payload = JSON.parse(rawBody.toString()); } catch { payload = {}; }

  if (payload.type === "sim.payment_intent.succeeded") {
    const piId = payload.data?.object?.id;
    if (piId) {
      const paymentResult = await db.query("SELECT * FROM payments WHERE webhook_event_id = $1", [piId]);
      if (paymentResult.rows[0]) {
        const payment = mapPayment(paymentResult.rows[0]);
        await db.query(`UPDATE bookings SET status = 'confirmed', updated_at = now() WHERE id = $1`, [payment.booking_id]);
        await db.query(`UPDATE payments SET gateway_status = 'success', updated_at = now() WHERE id = $1`, [payment.id]);
        logger.info("Simulated payment confirmed", { bookingId: payment.booking_id });
      }
    }
    return { received: true };
  }

  // Real Stripe webhook
  if (!env.stripeWebhookSecret) throw new ApiError(500, "Webhook secret not configured.", "WEBHOOK_NOT_CONFIGURED");
  const stripe = getStripe();
  if (!stripe) throw new ApiError(500, "Stripe not configured.", "STRIPE_NOT_CONFIGURED");

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, env.stripeWebhookSecret);
  } catch (err) {
    logger.error("Stripe webhook verification failed", { error: err.message });
    throw new ApiError(400, `Webhook verification failed: ${err.message}`, "WEBHOOK_INVALID");
  }

  logger.info("Stripe webhook received", { type: event.type, id: event.id });
  const paymentIntent = event.data.object;
  const paymentResult = await db.query("SELECT * FROM payments WHERE webhook_event_id = $1", [paymentIntent.id]);
  if (!paymentResult.rows[0]) { return { received: true }; }

  const payment = mapPayment(paymentResult.rows[0]);
  const bookingId = payment.booking_id;

  if (event.type === "payment_intent.succeeded") {
    await db.query(`UPDATE bookings SET status = 'confirmed', updated_at = now() WHERE id = $1`, [bookingId]);
    await db.query(`UPDATE payments SET gateway_status = 'success', updated_at = now() WHERE id = $1`, [payment.id]);
    logger.info("Booking confirmed via Stripe webhook", { bookingId });
    try {
      const booking = await bookingService.getBookingById(bookingId);
      await auditService.log({
        actorId: booking?.passenger_id, action: auditService.AUDIT_ACTIONS.PAYMENT_WEBHOOK_RECEIVED,
        entityType: "payment", entityId: payment.id,
        metadata: { booking_id: bookingId, status: "succeeded" }
      });
    } catch {}
  } else if (event.type === "payment_intent.payment_failed") {
    await db.query(`UPDATE bookings SET status = 'failed', updated_at = now() WHERE id = $1`, [bookingId]);
    await db.query(`UPDATE payments SET gateway_status = 'failed', updated_at = now() WHERE id = $1`, [payment.id]);
    logger.info("Booking failed via Stripe webhook", { bookingId });
  }

  return { received: true };
};

/**
 * Confirm payment after user submits card on frontend.
 * Validates booking ownership, marks booking as confirmed.
 * No Stripe verification needed for simulated/demo payments.
 */
const confirmPaymentFromFrontend = async ({ user, paymentIntentId, bookingId }) => {
  // Support both payment_intent_id and direct booking_id
  let payment = null;
  let bid = bookingId;

  if (paymentIntentId) {
    const paymentResult = await db.query(
      "SELECT * FROM payments WHERE webhook_event_id = $1 OR idempotency_key = $1",
      [paymentIntentId]
    );
    if (paymentResult.rows[0]) {
      payment = mapPayment(paymentResult.rows[0]);
      bid = payment.booking_id;
    }
  }

  if (!bid) throw new ApiError(422, "Booking ID or Payment Intent ID required.", "VALIDATION_ERROR");

  // Verify booking belongs to this user
  const booking = await bookingService.getBookingById(bid);
  if (!booking) throw new ApiError(404, "Booking not found.", "BOOKING_NOT_FOUND");
  if (booking.passenger_id !== user.id) throw new ApiError(403, "Forbidden.", "FORBIDDEN");

  // Mark booking confirmed
  await db.query(`UPDATE bookings SET status = 'confirmed', updated_at = now() WHERE id = $1`, [bid]);

  if (payment) {
    await db.query(`UPDATE payments SET gateway_status = 'success', updated_at = now() WHERE id = $1`, [payment.id]);
  } else {
    // Create a payment record if one doesn't exist
    const trip = await getTripById(booking.trip_id);
    if (trip) {
      await db.query(
        `INSERT INTO payments (booking_id, idempotency_key, amount, currency, gateway_name, gateway_status, gateway_txn_id, webhook_event_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT DO NOTHING`,
        [bid, `demo_${Date.now()}`, trip.fare, trip.currency, "stripe", "success", `demo_${Date.now()}`, `demo_${Date.now()}`]
      );
    }
  }

  logger.info("Booking confirmed (simulated payment)", { bookingId: bid, userId: user.id });
  return { success: true, booking_id: bid };
};

module.exports = { createPaymentSession, confirmPaymentFromFrontend, handleStripeWebhook, getPaymentByBookingId, getPaymentById };
