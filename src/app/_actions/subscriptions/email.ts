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
    auth: { user: smtpUser, pass: smtpPass },
  });
}

export async function sendSubscriptionStatusEmail(to: string, fullName: string | undefined, subscriptionId: string, status: string, note?: string) {
  const transporter = createTransporter();

  const subjMap: Record<string, string> = {
    active: `Subscription activated — ${subscriptionId}`,
    under_review: `Subscription under review — ${subscriptionId}`,
    suspended: `Subscription suspended — ${subscriptionId}`,
    cancelled: `Subscription cancelled — ${subscriptionId}`,
  };

  const subject = subjMap[status] ?? `Subscription update — ${subscriptionId}`;

  // Friendly, slightly surprising note when provided
  const surprise = note
    ? `<p style="font-style:italic;color:#555;">Note from our team: "${note}"</p>`
    : '<p style="font-style:italic;color:#555;">A little heads-up: we appreciate your patience while we sort this out.</p>';

  let bodyIntro = '';
  if (status === 'active') {
    bodyIntro = `<p>Good news${fullName ? `, ${fullName}` : ''}! Your subscription <strong>${subscriptionId}</strong> is now active.</p>`;
  } else if (status === 'under_review') {
    bodyIntro = `<p>Hello${fullName ? `, ${fullName}` : ''}. We're currently reviewing your subscription <strong>${subscriptionId}</strong>.</p>`;
  } else if (status === 'suspended') {
    bodyIntro = `<p>Hi${fullName ? `, ${fullName}` : ''}. Your subscription <strong>${subscriptionId}</strong> has been temporarily suspended.</p>`;
  } else if (status === 'cancelled') {
    bodyIntro = `<p>Hi${fullName ? `, ${fullName}` : ''}. Your subscription <strong>${subscriptionId}</strong> has been cancelled.</p>`;
  } else {
    bodyIntro = `<p>Hi${fullName ? `, ${fullName}` : ''}. There's an update for your subscription <strong>${subscriptionId}</strong>.</p>`;
  }

  const html = `
    ${bodyIntro}
    ${surprise}
    <p style="color:#888;font-size:13px;">If you have questions, reply to this email or contact support.</p>
  `;

  if (!transporter) {
    // eslint-disable-next-line no-console
    console.info('[Subscription Email] SMTP not configured, email content:');
    // eslint-disable-next-line no-console
    console.info({ to, subject, html });
    return;
  }

  await transporter.sendMail({ from: smtpFrom, to, subject, html });
}

// Only named async functions are exported from this module.
