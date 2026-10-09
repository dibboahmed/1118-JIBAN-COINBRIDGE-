import { sendOtpEmail } from '../../src/otpService';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { email } = req.body || {};
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ success: false, error: 'Please enter a valid email address.' });
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ success: false, error: 'Invalid email address format. Please enter a valid email (e.g. user@gmail.com).' });
    }

    const result = await sendOtpEmail(email);
    return res.status(200).json({
      success: true,
      message: result.isRealSmtp
        ? `Verification code dispatched to your Gmail inbox: ${email}`
        : `Verification code generated for ${email}`,
      isRealSmtp: result.isRealSmtp,
      devCode: result.isRealSmtp ? null : result.code,
    });
  } catch (err: any) {
    console.error('Error in /api/auth/send-code:', err);
    return res.status(500).json({ success: false, error: 'Failed to send verification code. ' + (err?.message || '') });
  }
}
