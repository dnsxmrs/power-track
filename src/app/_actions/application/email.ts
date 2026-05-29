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

export async function sendApplicationSubmittedEmail(to: string, fullName: string, ticketNumber: string) {
  const transporter = createTransporter();

  const subject = `We received your application — ${ticketNumber}`;
  const html = `
    <p>Hi ${fullName || ''},</p>
    <p>Thank you for choosing PowerTrack. We have received your application (ticket <strong>${ticketNumber}</strong>).</p>
    <p>Our team will review your application and we will email you the payment instructions to proceed with the downpayment.</p>
    <p style="color:#888;font-size:13px;">If you have questions, reply to this email or contact your administrator.</p>
  `;

  if (!transporter) {
    // Log in non-production environments
    // eslint-disable-next-line no-console
    console.info('[Application Email] SMTP not configured, email content:');
    // eslint-disable-next-line no-console
    console.info({ to, subject, html });
    return;
  }

  await transporter.sendMail({ from: smtpFrom, to, subject, html });
}

export async function sendApplicationAwaitingDownpaymentEmail(to: string, fullName: string, ticketNumber: string) {
  const transporter = createTransporter();

  const subject = `Application reviewed — proceed to downpayment (${ticketNumber})`;
  const gcashNumber = '09272914369';
  const html = `
    <p>Hi ${fullName || ''},</p>
    <p>Your application (ticket <strong>${ticketNumber}</strong>) has been reviewed and is ready to proceed to downpayment.</p>
    <p>Please send the downpayment to the following account (GCash): <strong>${gcashNumber}</strong>.</p>
    <p>After sending payment, reply to this email with the transaction details so we can verify and activate your subscription.</p>
    <p style="color:#888;font-size:13px;">If you need help, reply to this email or contact your administrator.</p>
  `;

  if (!transporter) {
    // eslint-disable-next-line no-console
    console.info('[Application Email] SMTP not configured, email content:');
    // eslint-disable-next-line no-console
    console.info({ to, subject, html });
    return;
  }

  await transporter.sendMail({ from: smtpFrom, to, subject, html });
}

export async function sendApplicationApprovedEmail(to: string, fullName: string, ticketNumber: string, installationDate: Date) {
  const transporter = createTransporter();

  const subject = `Application approved — installation scheduled (${ticketNumber})`;
  const dateLabel = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(installationDate);
  const html = `
    <p>Hi ${fullName || ''},</p>
    <p>Your application (ticket <strong>${ticketNumber}</strong>) has been approved.</p>
    <p>We have scheduled installation on <strong>${dateLabel}</strong>. This is at least 7 days from approval; if that date fell on a weekend we scheduled the next weekday.</p>
    <p>Our installation team will contact you with the exact time and any preparations required.</p>
    <p style="color:#888;font-size:13px;">If you need to reschedule, reply to this email.</p>
  `;

  if (!transporter) {
    // eslint-disable-next-line no-console
    console.info('[Application Email] SMTP not configured, email content:');
    // eslint-disable-next-line no-console
    console.info({ to, subject, html });
    return;
  }

  await transporter.sendMail({ from: smtpFrom, to, subject, html });
}

export async function sendApplicationRejectedEmail(to: string, fullName: string, ticketNumber: string, reason?: string) {
  const transporter = createTransporter();

  const subject = `Application update — ${ticketNumber}`;
  const reasonHtml = reason ? `<p><strong>Reason:</strong> ${reason}</p>` : '';
  const html = `
    <p>Hi ${fullName || ''},</p>
    <p>We're sorry to inform you that your application (ticket <strong>${ticketNumber}</strong>) has been rejected.</p>
    ${reasonHtml}
    <p style="color:#888;font-size:13px;">If you believe this is an error or would like more information, reply to this email.</p>
  `;

  if (!transporter) {
    // eslint-disable-next-line no-console
    console.info('[Application Email] SMTP not configured, email content:');
    // eslint-disable-next-line no-console
    console.info({ to, subject, html });
    return;
  }

  await transporter.sendMail({ from: smtpFrom, to, subject, html });
}

// Only named async functions are exported from this "use server" module.
