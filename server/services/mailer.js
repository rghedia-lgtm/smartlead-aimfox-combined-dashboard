const nodemailer = require('nodemailer');

function createTransport() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.OWNER_EMAIL,
      pass: process.env.OWNER_EMAIL_APP_PASSWORD,
    },
  });
}

async function sendOtp(otp) {
  const transporter = createTransport();
  await transporter.sendMail({
    from: `"Campaign Dashboard" <${process.env.OWNER_EMAIL}>`,
    to: process.env.OWNER_EMAIL,
    subject: 'Your Dashboard Login Code',
    html: `
      <div style="font-family:sans-serif;max-width:400px;margin:0 auto;padding:2rem">
        <h2 style="color:#1e293b">Dashboard Login Request</h2>
        <p style="color:#475569">A new device is attempting to access your dashboard. Your one-time code is:</p>
        <div style="font-size:2.5rem;font-weight:700;letter-spacing:0.3em;color:#2563eb;padding:1rem;background:#eff6ff;border-radius:8px;text-align:center;margin:1.5rem 0">
          ${otp}
        </div>
        <p style="color:#94a3b8;font-size:0.85rem">This code expires in 10 minutes. If you did not request this, ignore this email.</p>
      </div>
    `,
  });
}

module.exports = { sendOtp };
