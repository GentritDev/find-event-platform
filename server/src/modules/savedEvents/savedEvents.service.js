"use strict";

const savedEventsRepository = require("./savedEvents.repository");
const eventsRepository = require("../events/events.repository");

class SavedEventsService {
  async getSavedEvents(user_id) {
    return savedEventsRepository.findByUserId(user_id);
  }

  async saveEvent(user_id, event_id) {
    const event = await eventsRepository.findById(event_id);
    if (!event) {
      const err = new Error("Event not found");
      err.status = 404;
      throw err;
    }

    const alreadySaved = await savedEventsRepository.existsByUserIdAndEventId(
      user_id,
      event_id,
    );
    if (alreadySaved) {
      return { alreadySaved: true };
    }

    return savedEventsRepository.create({ user_id, event_id });
  }

  async unsaveEvent(user_id, event_id) {
    const result = await savedEventsRepository.deleteByUserIdAndEventId(
      user_id,
      event_id,
    );
    if (!result) {
      const err = new Error("Saved event not found");
      err.status = 404;
      throw err;
    }
    return result;
  }
}

module.exports = new SavedEventsService();
