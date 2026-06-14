const paymentService = require("../modules/payment/services/payment.service.js");
const logger = require("../shared/utils/logger.js");

const runPaymentRetryJob = async () => {
  logger.info("Payment retry job started");
  const results = await paymentService.retryFailedPaymentVerification();
  logger.info("Payment retry job completed", { processed: results.length });
  return results;
};

module.exports = {
  runPaymentRetryJob
};
