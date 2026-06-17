const SibApiV3Sdk = require('sib-api-v3-sdk');
const env = require("../../config/env.js");
const logger = require("../utils/logger.js");

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
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>OTP Verification</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #f4f7fa;
      margin: 0;
      padding: 0;
    }
    .email-container {
      max-width: 600px;
      margin: 40px auto;
      background-color: #ffffff;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }
    .email-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #ffffff;
      text-align: center;
      padding: 30px 20px;
    }
    .email-header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 600;
    }
    .email-header .icon {
      font-size: 48px;
      margin-bottom: 10px;
    }
    .email-body {
      padding: 40px 30px;
      color: #333333;
      line-height: 1.6;
    }
    .email-body h2 {
      color: #667eea;
      margin-top: 0;
      font-size: 22px;
    }
    .otp-box {
      background-color: #f8f9ff;
      border: 2px solid #667eea;
      border-radius: 8px;
      padding: 20px;
      text-align: center;
      margin: 30px 0;
    }
    .otp-code {
      font-size: 36px;
      font-weight: bold;
      color: #667eea;
      letter-spacing: 8px;
      font-family: 'Courier New', monospace;
    }
    .security-note {
      background-color: #fff3cd;
      border-left: 4px solid #ffc107;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .security-note strong {
      color: #856404;
    }
    .email-footer {
      background-color: #f8f9fa;
      color: #6c757d;
      text-align: center;
      padding: 25px 20px;
      font-size: 14px;
      border-top: 1px solid #e9ecef;
    }
    .email-footer .motivational {
      color: #667eea;
      font-weight: 600;
      margin-bottom: 10px;
    }
    .email-footer .closing {
      margin-top: 15px;
      font-style: italic;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="email-header">
      <div class="icon">🚍</div>
      <h1>Transportation Management System</h1>
    </div>
    <div class="email-body">
      <h2>Hello,</h2>
      <p>Welcome to the <strong>Transportation Management System</strong>.</p>
      <p>Your verification code is:</p>
      <div class="otp-box">
        <div class="otp-code">${otp}</div>
      </div>
      <div class="security-note">
        <strong>Security Note:</strong> This code expires in <strong>5 minutes</strong>. Do not share this code with anyone.
      </div>
      <p>If you did not request this code, please ignore this email or contact support if you have concerns.</p>
    </div>
    <div class="email-footer">
      <div class="motivational">
        Connecting people, simplifying transportation, and building smarter journeys every day.
      </div>
      <div class="closing">
        Thank you for using Transportation Management System.
      </div>
    </div>
  </div>
</body>
</html>
  `;
};

const sendOtpEmail = async ({ to, otp }) => {
  if (!brevoClient) {
    brevoClient = initializeBrevo();
  }

  if (!brevoClient) {
    logger.error("Brevo client not available. Cannot send OTP email.");
    throw new Error("Email service is not configured.");
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
    throw new Error(`Failed to send OTP email: ${error.message}`);
  }
};

module.exports = {
  sendOtpEmail,
  initializeBrevo,
};
