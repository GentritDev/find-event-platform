"use strict";

const savedEventsService = require("./savedEvents.service");

class SavedEventsController {
  async getSavedEvents(req, res, next) {
    try {
      const savedEvents = await savedEventsService.getSavedEvents(req.user.id);
      return res.json({ success: true, data: savedEvents });
    } catch (err) {
      next(err);
    }
  }

  async saveEvent(req, res, next) {
    try {
      const { event_id } = req.params;
      const result = await savedEventsService.saveEvent(req.user.id, event_id);
      return res.status(201).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async unsaveEvent(req, res, next) {
    try {
      const { event_id } = req.params;
      await savedEventsService.unsaveEvent(req.user.id, event_id);
      return res.json({
        success: true,
        message: "Event removed from saved list",
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new SavedEventsController();
