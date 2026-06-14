const crypto = require("crypto");
const env = require("../../../config/env.js");

const createMockPaymentSession = ({ paymentId, bookingId, amount }) => {
  const providerReference = `mock_${crypto.randomUUID()}`;
  const paymentUrl = `${env.paymentSessionBaseUrl}/${providerReference}`;

  return {
    providerReference,
    paymentUrl,
    metadata: {
      provider: "mock",
      payment_id: paymentId,
      booking_id: bookingId,
      amount
    }
  };
};

const verifyWebhookSignature = ({ signature, providerReference, event, status }) => {
  if (!signature) return false;

  const payload = `${providerReference}.${event}.${status}`;
  const expected = crypto
    .createHmac("sha256", env.paymentWebhookSecret)
    .update(payload)
    .digest("hex");

  if (signature.length !== expected.length) return false;

  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
};

module.exports = {
  createMockPaymentSession,
  verifyWebhookSignature
};
