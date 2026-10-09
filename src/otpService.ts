import nodemailer, { type Transporter } from 'nodemailer';

interface OtpRecord {
  code: string;
  expiresAt: number;
  attempts: number;
}

const otpStore = new Map<string, OtpRecord>();
let transporterPromise: Promise<Transporter> | null = null;

async function getTransporter(): Promise<Transporter> {
  if (transporterPromise) return transporterPromise;

  transporterPromise = (async () => {
    // 1. Gmail App Password support
    if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
      console.log('[EmailService] Using Gmail SMTP for', process.env.GMAIL_USER);
      return nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD,
        },
      });
    }

    // 2. Custom SMTP credentials support
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      console.log('[EmailService] Using custom SMTP server:', process.env.SMTP_HOST);
      return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: Number(process.env.SMTP_PORT) === 465,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    }

    // 3. In-memory / JSON Transport fallback when SMTP credentials are not configured
    console.log('[EmailService] No live SMTP credentials provided; using instantaneous JSON transport for testing');
    return nodemailer.createTransport({
      jsonTransport: true,
    });
  })();

  return transporterPromise;
}

export async function sendOtpEmail(toEmail: string) {
  const cleanEmail = toEmail.toLowerCase().trim();
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

  otpStore.set(cleanEmail, {
    code,
    expiresAt,
    attempts: 0,
  });

  const transporter = await getTransporter();
  const sender =
    process.env.EMAIL_FROM ||
    process.env.GMAIL_USER ||
    '"CoinBridge Security" <noreply@coinbridge.io>';

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #faf6eb; margin: 0; padding: 24px; }
    .card { max-width: 480px; margin: 0 auto; background-color: #fbf8f0; border-radius: 20px; border: 1px solid #ded5c6; padding: 32px 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
    .brand { font-size: 24px; font-weight: 700; color: #252c3c; letter-spacing: -0.03em; margin-bottom: 20px; }
    .title { font-size: 20px; font-weight: 600; margin-bottom: 8px; color: #252c3c; }
    .subtitle { font-size: 14px; color: #667080; line-height: 1.6; }
    .otp-box { background-color: #fffdf8; border: 2px solid #df725b; border-radius: 14px; padding: 22px; text-align: center; margin: 24px 0; }
    .otp-code { font-size: 38px; font-weight: 700; letter-spacing: 10px; color: #df725b; font-family: monospace; }
    .footer { font-size: 12px; color: #858c96; text-align: center; margin-top: 24px; line-height: 1.6; }
  </style>
</head>
<body>
  <div class="card">
    <div class="brand">CoinBridge</div>
    <div class="title">Your One-Time Passcode</div>
    <div class="subtitle">Enter the 6-digit code below to securely sign in to your CoinBridge account. This code is valid for 10 minutes.</div>
    <div class="otp-box">
      <div class="otp-code">${code}</div>
    </div>
    <div class="footer">
      If you did not request this verification code, please ignore this email.<br>
      For your security, never share this code with anyone.
    </div>
  </div>
</body>
</html>
`;

  try {
    const info = await transporter.sendMail({
      from: sender,
      to: cleanEmail,
      subject: `Your CoinBridge Verification Code: ${code}`,
      text: `Your CoinBridge verification code is: ${code}. It expires in 10 minutes.`,
      html,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.log(`[EmailService] OTP sent to ${cleanEmail}. Message ID: ${info.messageId}`);
    if (previewUrl) {
      console.log(`[EmailService] Live Ethereal inbox URL: ${previewUrl}`);
    }

    return {
      success: true,
      code,
      previewUrl: previewUrl || null,
      isRealSmtp: !!(process.env.GMAIL_USER || process.env.SMTP_HOST),
    };
  } catch (error: any) {
    console.error('[EmailService] Failed to send email:', error);
    // If SMTP fails, the code is still in otpStore so user can verify if needed, but report error
    throw error;
  }
}

export function verifyOtp(email: string, code: string) {
  const cleanEmail = email.toLowerCase().trim();
  const cleanCode = code.replace(/\D/g, '').trim();
  const record = otpStore.get(cleanEmail);

  if (!record) {
    return {
      success: false,
      error: 'No verification code was requested for this email. Please request a new code.',
    };
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(cleanEmail);
    return {
      success: false,
      error: 'The verification code has expired. Please request a new one.',
    };
  }

  if (record.attempts >= 5) {
    otpStore.delete(cleanEmail);
    return {
      success: false,
      error: 'Too many incorrect attempts. For security, please request a new code.',
    };
  }

  if (record.code !== cleanCode) {
    record.attempts += 1;
    return {
      success: false,
      error: `Invalid code. That is not the code sent to ${cleanEmail}. Please enter the correct code.`,
    };
  }

  // Successfully verified
  otpStore.delete(cleanEmail);
  return {
    success: true,
    email: cleanEmail,
  };
}
