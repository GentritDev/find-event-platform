'use strict';

const ticketsRepository = require('./tickets.repository');
const { generateQRToken, generateQRCodeDataURL } = require('../../utils/qr');
const notificationsService = require('../notifications/notifications.service');
const { sendTicketConfirmationEmail } = require('../../config/mail');
const authRepository = require('../auth/auth.repository');
const eventsRepository = require('../events/events.repository');

class TicketsService {
  async generateTicket({ order_id, user_id, event_id }) {
    const qr_token = generateQRToken();
    const ticket = await ticketsRepository.create({ order_id, user_id, event_id, qr_token });

    // Send notification and email asynchronously (don't block)
    this._sendConfirmations(ticket, user_id, event_id).catch((err) => {
      console.error('[tickets] Post-purchase notification error:', err.message);
    });

    return ticket;
  }

  async _sendConfirmations(ticket, user_id, event_id) {
    const [user, event] = await Promise.all([
      authRepository.findById(user_id),
      eventsRepository.findById(event_id),
    ]);

    if (user && event) {
      // In-app notification
      await notificationsService.create({
        user_id,
        title: 'Ticket Confirmed!',
        body: `Your ticket for "${event.title}" has been confirmed. Your QR token: ${ticket.qr_token.slice(0, 12)}...`,
        type: 'ticket',
      });

      // Email notification
      await sendTicketConfirmationEmail({
        to: user.email,
        userName: user.full_name,
        eventTitle: event.title,
        eventDate: event.start_at,
        qrToken: ticket.qr_token,
        ticketId: ticket.id,
      });
    }
  }

  async getMyTickets(user_id) {
    const tickets = await ticketsRepository.findByUserId(user_id);

    // Generate QR code data URLs for each ticket
    const ticketsWithQR = await Promise.all(
      tickets.map(async (t) => {
        const qrCodeDataUrl = await generateQRCodeDataURL(t.qr_token);
        return { ...t, qr_code_data_url: qrCodeDataUrl };
      })
    );

    return ticketsWithQR;
  }

  async verifyQRToken(qr_token, verifier_id) {
    const ticket = await ticketsRepository.findByQRToken(qr_token);

    if (!ticket) {
      const err = new Error('Ticket not found');
      err.status = 404;
      throw err;
    }

    if (ticket.status === 'used') {
      return {
        valid: false,
        message: 'Ticket already used',
        ticket,
      };
    }

    if (ticket.status === 'cancelled') {
      return {
        valid: false,
        message: 'Ticket is cancelled',
        ticket,
      };
    }

    const updated = await ticketsRepository.markAsUsed(ticket.id, verifier_id);
    return {
      valid: true,
      message: 'Ticket verified successfully',
      ticket: updated,
    };
  }

  async getEventTickets(event_id) {
    return ticketsRepository.findByEventId(event_id);
  }
}

module.exports = new TicketsService();
