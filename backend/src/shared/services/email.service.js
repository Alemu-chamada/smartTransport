const SibApiV3Sdk = require('sib-api-v3-sdk');
const env = require("../../config/env.js");
const logger = require("../utils/logger.js");
const ApiError = require("../utils/apiError.js");

// Initialize Brevo (formerly Sendinblue) client
let brevoClient = null;

const initializeBrevo = () => {
  const apiKey = process.env.BREVO_API_KEY || env.brevoApiKey;
  
  if (!apiKey) {
    logger.warn("Brevo API key not configured. Email service disabled.");
    return null;
  }

  try {
    const defaultClient = SibApiV3Sdk.ApiClient.instance;
    const apiKeyAuth = defaultClient.authentications['api-key'];
    apiKeyAuth.apiKey = apiKey;
    
    brevoClient = new SibApiV3Sdk.TransactionalEmailsApi();
    logger.info("Brevo email service initialized successfully");
    console.log("✅ Brevo email service ready");
    return brevoClient;
  } catch (error) {
    logger.error("Failed to initialize Brevo client", {
      error: error.message,
    });
    return null;
  }
};

const generateOtpEmailHtml = (otp) => {
  const digits = String(otp).split('');
  const digitBoxes = digits.map(d =>
    `<span style="display:inline-block;width:44px;height:56px;line-height:56px;text-align:center;font-size:28px;font-weight:800;color:#4f46e5;background:#f0f0ff;border:2px solid #c7d2fe;border-radius:10px;margin:0 4px;font-family:'Courier New',monospace;">${d}</span>`
  ).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Smart Transport — Verification Code</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#4f46e5 0%,#7c3aed 100%);border-radius:20px 20px 0 0;padding:40px 40px 32px;text-align:center;">
            <div style="font-size:52px;margin-bottom:12px;">🚌</div>
            <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.3px;">Smart Transport System</h1>
            <p style="margin:6px 0 0;color:rgba(255,255,255,0.7);font-size:14px;">Your journey, secured.</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="background:#ffffff;padding:40px 40px 32px;">
            <p style="margin:0 0 6px;font-size:13px;font-weight:600;color:#6366f1;text-transform:uppercase;letter-spacing:1px;">Security Verification</p>
            <h2 style="margin:0 0 16px;font-size:26px;font-weight:700;color:#0f172a;">Here's your one-time code</h2>
            <p style="margin:0 0 28px;font-size:15px;color:#64748b;line-height:1.6;">Use the code below to verify your identity and continue. It was made just for you and expires in <strong style="color:#0f172a;">5 minutes</strong>.</p>

            <!-- OTP Digits -->
            <div style="text-align:center;margin:0 0 28px;padding:28px 20px;background:#fafafa;border-radius:16px;border:1px solid #e2e8f0;">
              ${digitBoxes}
              <p style="margin:16px 0 0;font-size:12px;color:#94a3b8;">Single-use code · Expires in 5 minutes</p>
            </div>

            <!-- Security Alert -->
            <div style="background:#fffbeb;border:1px solid #fde68a;border-left:4px solid #f59e0b;border-radius:10px;padding:16px 20px;margin-bottom:28px;">
              <p style="margin:0;font-size:13px;color:#92400e;line-height:1.5;">
                🔒 <strong>Never share this code</strong> with anyone — not even our team. Smart Transport will <em>never</em> ask for your OTP by phone or email.
              </p>
            </div>

            <p style="margin:0;font-size:14px;color:#94a3b8;line-height:1.6;">If you didn't request this code, you can safely ignore this email. No action is needed.</p>
          </td>
        </tr>

        <!-- Divider with tagline -->
        <tr>
          <td style="background:linear-gradient(135deg,#4f46e5 0%,#7c3aed 100%);padding:24px 40px;text-align:center;">
            <p style="margin:0;color:rgba(255,255,255,0.9);font-size:14px;font-weight:500;font-style:italic;">
              "Connecting people, simplifying journeys, building smarter transportation — every day."
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f8fafc;border-radius:0 0 20px 20px;padding:24px 40px;text-align:center;border:1px solid #e2e8f0;border-top:none;">
            <p style="margin:0 0 4px;font-size:13px;color:#475569;font-weight:600;">Smart Transport Management System</p>
            <p style="margin:0;font-size:12px;color:#94a3b8;">
              <a href="mailto:smarttransportserv@gmail.com" style="color:#6366f1;text-decoration:none;">smarttransportserv@gmail.com</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
};

const sendOtpEmail = async ({ to, otp }) => {
  if (!brevoClient) {
    brevoClient = initializeBrevo();
  }

  if (!brevoClient) {
    logger.error("Brevo client not available. BREVO_API_KEY is missing in environment.");
    throw new ApiError(
      503,
      "Email service is not configured on the server. Please contact support.",
      "EMAIL_SERVICE_UNAVAILABLE"
    );
  }

  if (!to) {
    throw new Error("Recipient email address is required.");
  }

  if (!otp) {
    throw new Error("OTP code is required.");
  }

  const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
  
  sendSmtpEmail.sender = {
    name: "Smart Transport System",
    email: "smarttransportserv@gmail.com"
  };
  
  sendSmtpEmail.to = [{ email: to }];
  sendSmtpEmail.subject = "Smart Transport - Your Verification Code";
  sendSmtpEmail.htmlContent = generateOtpEmailHtml(otp);
  sendSmtpEmail.textContent = `Your verification code is: ${otp}. This code expires in 5 minutes. Do not share this code with anyone.`;

  try {
    const data = await brevoClient.sendTransacEmail(sendSmtpEmail);
    
    console.log("✅ OTP email sent successfully via Brevo");
    console.log("   📧 Recipient:", to);
    console.log("   📨 Message ID:", data.messageId);
    console.log("   ⏱️  Timestamp:", new Date().toISOString());
    console.log("   ℹ️  Check your inbox and SPAM folder");
    console.log("   🔗 Monitor delivery at: https://app.brevo.com/statistics/email");
    
    logger.info("OTP email sent successfully", {
      messageId: data.messageId,
      recipient: to,
      timestamp: new Date().toISOString(),
    });

    return {
      success: true,
      messageId: data.messageId,
    };
  } catch (error) {
    console.error("❌ Failed to send OTP email - Brevo API Error:");
    console.error("   Error:", error.message);
    console.error("   Body:", error.body);
    console.error("   Code:", error.code);
    
    logger.error("Failed to send OTP email", {
      error: error.message,
      errorBody: error.body,
      errorCode: error.code,
      recipient: to,
    });
    throw new ApiError(
      503,
      "Failed to send verification email. Please try again later.",
      "EMAIL_SEND_FAILED"
    );
  }
};

module.exports = {
  sendOtpEmail,
  initializeBrevo,
};
