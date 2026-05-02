'use strict';

const ticketsService = require('./tickets.service');

class TicketsController {
  async getMyTickets(req, res, next) {
    try {
      const tickets = await ticketsService.getMyTickets(req.user.id);
      return res.json({ success: true, data: tickets });
    } catch (err) {
      next(err);
    }
  }

  async verifyTicket(req, res, next) {
    try {
      const { qr_token } = req.body;
      if (!qr_token) {
        return res.status(400).json({ success: false, message: 'qr_token is required' });
      }
      const result = await ticketsService.verifyQRToken(qr_token, req.user.id);
      return res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async getEventTickets(req, res, next) {
    try {
      const tickets = await ticketsService.getEventTickets(req.params.event_id);
      return res.json({ success: true, data: tickets });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new TicketsController();
