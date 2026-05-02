'use strict';

const eventsService = require('./events.service');

class EventsController {
  async listEvents(req, res, next) {
    try {
      const result = await eventsService.listEvents(req.query);
      return res.json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  }

  async getEvent(req, res, next) {
    try {
      const event = await eventsService.getEventById(req.params.id);
      return res.json({ success: true, data: event });
    } catch (err) {
      next(err);
    }
  }

  async getOrganizerEvents(req, res, next) {
    try {
      const events = await eventsService.getOrganizerEvents(req.user.id, req.query);
      return res.json({ success: true, data: events });
    } catch (err) {
      next(err);
    }
  }

  async createEvent(req, res, next) {
    try {
      const event = await eventsService.createEvent(req.user.id, req.body);
      return res.status(201).json({ success: true, data: event });
    } catch (err) {
      next(err);
    }
  }

  async updateEvent(req, res, next) {
    try {
      const event = await eventsService.updateEvent(req.params.id, req.user.id, req.body, req.user.role);
      return res.json({ success: true, data: event });
    } catch (err) {
      next(err);
    }
  }

  async publishEvent(req, res, next) {
    try {
      const event = await eventsService.publishEvent(req.params.id, req.user.id, req.user.role);
      return res.json({ success: true, data: event });
    } catch (err) {
      next(err);
    }
  }

  async cancelEvent(req, res, next) {
    try {
      const event = await eventsService.cancelEvent(req.params.id, req.user.id, req.user.role);
      return res.json({ success: true, data: event });
    } catch (err) {
      next(err);
    }
  }

  async deleteEvent(req, res, next) {
    try {
      await eventsService.deleteEvent(req.params.id, req.user.id);
      return res.json({ success: true, message: 'Event deleted' });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new EventsController();
