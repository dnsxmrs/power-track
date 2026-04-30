'use server';

import nodemailer from 'nodemailer';

const smtpHost = process.env.SMTP_HOST?.trim() ?? '';
const smtpUser = process.env.SMTP_USER?.trim() ?? '';
const smtpPass = process.env.SMTP_PASS ?? '';
const smtpFrom = process.env.SMTP_FROM || '"PowerTrack" <no-reply@powertrack.local>';
const parsedPort = Number(process.env.SMTP_PORT ?? '587');
const smtpPort = Number.isInteger(parsedPort) && parsedPort > 0 ? parsedPort : 587;
const secure = process.env.SMTP_SECURE === 'true';

function createTransporter() {
  if (!smtpHost || !smtpUser || !smtpPass) return null;
  return nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });
}

export async function sendAccountEmail(to: string, name: string, email: string, password: string) {
  const transporter = createTransporter();

  const subject = 'Your PowerTrack account';
  const html = `
    <p>Hi ${name || ''},</p>
    <p>Your account has been created. Use the credentials below to sign in:</p>
    <ul>
      <li><strong>Email:</strong> ${email}</li>
      <li><strong>Password:</strong> ${password}</li>
    </ul>
    <p>For security, please change your password after first login.</p>
    <p style="color:#888;font-size:13px;">If you did not request this, please contact your administrator.</p>
  `;

  if (!transporter) {
    // Log for non-production environments
    // eslint-disable-next-line no-console
    console.info('[Email] SMTP not configured, email content:');
    // eslint-disable-next-line no-console
    console.info({ to, subject, html });
    return;
  }

  await transporter.sendMail({
    from: smtpFrom,
    to,
    subject,
    html,
  });
}

export default sendAccountEmail;
