'use strict';

const nodemailer = require('nodemailer');
const env = require('./env');

const transporter = nodemailer.createTransport({
  host: env.BREVO_SMTP_HOST,
  port: env.BREVO_SMTP_PORT,
  secure: false,
  auth: {
    user: env.BREVO_SMTP_USER,
    pass: env.BREVO_SMTP_PASS,
  },
});

async function sendMail({ to, subject, html, text }) {
  if (!env.BREVO_SMTP_USER || !env.BREVO_SMTP_PASS) {
    console.warn('[mail] SMTP credentials not configured, skipping email send.');
    return;
  }

  return transporter.sendMail({
    from: env.MAIL_FROM,
    to,
    subject,
    html,
    text,
  });
}

async function sendTicketConfirmationEmail({ to, userName, eventTitle, eventDate, qrToken, ticketId }) {
  const subject = `Your ticket for ${eventTitle} – Confirmation`;
  const html = `
    <div style="font-family: Arial, sans-serif; background: #0f0f17; color: #e2e8f0; padding: 32px; border-radius: 12px;">
      <h1 style="color: #a78bfa; margin-bottom: 8px;">🎟 Ticket Confirmed!</h1>
      <p>Hi <strong>${userName}</strong>,</p>
      <p>Your ticket for <strong>${eventTitle}</strong> has been confirmed.</p>
      <div style="background: #1a1a2e; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Event:</strong> ${eventTitle}</p>
        <p><strong>Date:</strong> ${new Date(eventDate).toLocaleString()}</p>
        <p><strong>Ticket ID:</strong> <code>${ticketId}</code></p>
        <p><strong>QR Token:</strong> <code style="font-size:12px;">${qrToken}</code></p>
      </div>
      <p style="color: #94a3b8;">Present this ticket at the entrance. The organizer will scan your QR code.</p>
      <p style="margin-top: 32px; color: #64748b; font-size: 12px;">Find Event Platform</p>
    </div>
  `;

  return sendMail({ to, subject, html });
}

module.exports = { sendMail, sendTicketConfirmationEmail };
