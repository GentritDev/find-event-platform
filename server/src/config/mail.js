'use strict';

const env = require('./env');

async function sendMail({ to, subject, html, text }) {
  if (!env.BREVO_API_KEY) {
    console.warn('[mail] BREVO_API_KEY not configured, skipping email send.');
    return;
  }

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': env.BREVO_API_KEY,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        sender: { email: env.MAIL_FROM },
        to: [{ email: to }],
        subject: subject,
        htmlContent: html,
        textContent: text
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('[mail] Failed to send email via Brevo:', errorData);
      return;
    }
    return await response.json();
  } catch (error) {
    console.error('[mail] Exception when sending email:', error);
  }
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
