const nodemailer = require('nodemailer');

function createTransport() {
  return nodemailer.createTransport({
    host: 'smtp.office365.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER || 'r.ghedia@kendra-intl.com',
      pass: process.env.SMTP_PASS,
    },
    tls: { ciphers: 'SSLv3' },
  });
}

async function sendReportEmail({ to, subject, attachments = [] }) {
  const transporter = createTransport();
  await transporter.sendMail({
    from: `"Campaign Dashboard" <${process.env.SMTP_USER || 'r.ghedia@kendra-intl.com'}>`,
    to,
    subject: subject || 'Campaign Dashboard Report',
    html: `
      <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:2rem">
        <h2 style="color:#1e293b">Campaign Dashboard Report</h2>
        <p style="color:#475569">Please find your campaign dashboard report attached.</p>
        <p style="color:#94a3b8;font-size:0.85rem">Generated on ${new Date().toLocaleString()}</p>
      </div>
    `,
    attachments,
  });
}

module.exports = { sendReportEmail };
