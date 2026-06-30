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
  const code = String(otp);

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>Your SmartTransport Verification Code</title>
  <!--[if mso]>
  <noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
  <![endif]-->
  <style>
    @media only screen and (max-width:600px){
      .email-wrapper { padding: 16px 8px !important; }
      .email-card    { border-radius: 16px !important; }
      .header-cell   { padding: 32px 24px 24px !important; }
      .body-cell     { padding: 32px 24px 24px !important; }
      .footer-cell   { padding: 20px 24px !important; }
      .otp-code      { font-size: 40px !important; letter-spacing: 10px !important; }
      .otp-box       { padding: 24px 16px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#f0f4f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
    class="email-wrapper" style="background-color:#f0f4f8;padding:40px 16px;">
    <tr><td align="center">

      <!-- Card -->
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0"
        class="email-card" style="max-width:600px;width:100%;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

        <!-- ── Header ── -->
        <tr>
          <td class="header-cell"
            style="background:linear-gradient(135deg,#FF4103 0%,#ff6a35 100%);padding:40px 48px 36px;text-align:center;">
            <!-- Logo mark -->
            <table role="presentation" align="center" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto 16px;">
              <tr>
                <td style="background:rgba(255,255,255,0.2);border-radius:14px;width:52px;height:52px;text-align:center;vertical-align:middle;">
                  <span style="font-size:26px;font-weight:900;color:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;line-height:52px;">ST</span>
                </td>
                <td style="padding-left:12px;vertical-align:middle;">
                  <span style="font-size:22px;font-weight:900;color:#ffffff;letter-spacing:-0.5px;">Smart</span><span style="font-size:22px;font-weight:900;color:rgba(255,255,255,0.75);letter-spacing:-0.5px;">Transport</span>
                </td>
              </tr>
            </table>
            <p style="margin:0;font-size:15px;color:rgba(255,255,255,0.85);font-weight:500;">Security Verification</p>
          </td>
        </tr>

        <!-- ── Body ── -->
        <tr>
          <td class="body-cell" style="padding:40px 48px 36px;background:#ffffff;">
            <h2 style="margin:0 0 10px;font-size:24px;font-weight:700;color:#0f172a;letter-spacing:-0.3px;">Your one-time code</h2>
            <p style="margin:0 0 28px;font-size:15px;color:#64748b;line-height:1.6;">
              Use this code to complete your verification. It expires in <strong style="color:#0f172a;">5&nbsp;minutes</strong>.
            </p>

            <!-- ── OTP Code Box ── -->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td class="otp-box" align="center"
                  style="background:#fff8f5;border:2px solid #FF4103;border-radius:16px;padding:28px 24px;">
                  <!--[if mso]>
                  <table role="presentation" align="center" cellpadding="0" cellspacing="0"><tr><td>
                  <![endif]-->
                  <span class="otp-code"
                    style="display:inline-block;font-size:48px;font-weight:900;letter-spacing:14px;color:#FF4103;font-family:'Courier New',Courier,monospace;white-space:nowrap;line-height:1.1;">${code}</span>
                  <!--[if mso]>
                  </td></tr></table>
                  <![endif]-->
                  <p style="margin:14px 0 0;font-size:12px;color:#94a3b8;letter-spacing:0.3px;">
                    Single-use &nbsp;·&nbsp; Expires in 5 minutes
                  </p>
                </td>
              </tr>
            </table>

            <!-- ── Security notice ── -->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:24px;">
              <tr>
                <td style="background:#fffbeb;border-left:4px solid #f59e0b;border-radius:8px;padding:14px 18px;">
                  <p style="margin:0;font-size:13px;color:#92400e;line-height:1.5;">
                    🔒 <strong>Never share this code</strong> — not even with our team. SmartTransport will never ask for your OTP by phone or email.
                  </p>
                </td>
              </tr>
            </table>

            <p style="margin:24px 0 0;font-size:13px;color:#94a3b8;line-height:1.6;">
              If you didn't request this, you can safely ignore this email.
            </p>
          </td>
        </tr>

        <!-- ── Tagline band ── -->
        <tr>
          <td style="background:#001621;padding:20px 48px;text-align:center;">
            <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.6);font-style:italic;line-height:1.5;">
              "Connecting people, simplifying journeys, building smarter transportation."
            </p>
          </td>
        </tr>

        <!-- ── Footer ── -->
        <tr>
          <td class="footer-cell"
            style="background:#f8fafc;border-radius:0 0 20px 20px;padding:24px 48px;text-align:center;border-top:1px solid #e2e8f0;">
            <p style="margin:0 0 4px;font-size:13px;font-weight:600;color:#475569;">SmartTransport Management System</p>
            <p style="margin:0;font-size:12px;color:#94a3b8;">
              <a href="mailto:smarttransportserv@gmail.com"
                style="color:#FF4103;text-decoration:none;">smarttransportserv@gmail.com</a>
              &nbsp;·&nbsp; Addis Ababa, Ethiopia
            </p>
          </td>
        </tr>

      </table>
      <!-- /Card -->

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
