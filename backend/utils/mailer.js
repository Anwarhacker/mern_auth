const nodemailer = require('nodemailer');

/**
 * Lazily creates the SMTP transporter so missing credentials don't crash on startup.
 */
const getTransporter = () =>
  nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT) || 2525,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

/**
 * Sends a styled password-reset email.
 * @param {string} to      - Recipient email
 * @param {string} resetUrl - Full reset URL with token
 */
const sendPasswordResetEmail = async (to, resetUrl) => {
  const transporter = getTransporter();

  await transporter.sendMail({
    from: `"AuthApp" <${process.env.EMAIL_FROM || 'noreply@authapp.com'}>`,
    to,
    subject: 'Password Reset Request — AuthApp',
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0f172a;color:#f1f5f9;padding:40px;border-radius:12px;">
        <div style="text-align:center;margin-bottom:32px;">
          <h1 style="color:#6366f1;font-size:28px;margin:0;">AuthApp</h1>
          <p style="color:#94a3b8;margin-top:8px;">Secure · Simple · Powerful</p>
        </div>
        <h2 style="color:#f1f5f9;font-size:22px;">Password Reset Request</h2>
        <p style="color:#94a3b8;line-height:1.7;">
          Someone requested a password reset for the account linked to this email.
          Click the button below to reset your password.
          This link will expire in <strong style="color:#f1f5f9;">1 hour</strong>.
        </p>
        <div style="text-align:center;margin:36px 0;">
          <a href="${resetUrl}"
             style="background:linear-gradient(135deg,#6366f1,#7c3aed);color:#fff;
                    padding:14px 36px;text-decoration:none;border-radius:8px;
                    font-weight:600;font-size:16px;display:inline-block;">
            Reset Password
          </a>
        </div>
        <p style="color:#64748b;font-size:14px;">
          If you did not request a password reset, please ignore this email.
          Your password will remain unchanged.
        </p>
        <hr style="border:none;border-top:1px solid #1e293b;margin:32px 0;">
        <p style="color:#64748b;font-size:12px;text-align:center;">
          © ${new Date().getFullYear()} AuthApp. All rights reserved.
        </p>
      </div>
    `,
  });
};

module.exports = { sendPasswordResetEmail };
