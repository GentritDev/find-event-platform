"use strict";

const eventsRepository = require("./events.repository");
const {
  createEventSchema,
  updateEventSchema,
  eventQuerySchema,
} = require("./events.schema");

class EventsService {
  async listEvents(query) {
    const parsed = eventQuerySchema.parse(query);
    const { data, total } = await eventsRepository.findAll(parsed);
    return {
      data,
      pagination: {
        page: parsed.page,
        limit: parsed.limit,
        total,
        pages: Math.ceil(total / parsed.limit),
      },
    };
  }

  async getEventById(id) {
    const event = await eventsRepository.findById(id);
    if (!event) {
      const err = new Error("Event not found");
      err.status = 404;
      throw err;
    }
    return event;
  }

  async getOrganizerEvents(organizerId, query = {}, role = "organizer") {
    if (role === "admin") {
      const result = await eventsRepository.findAll(query);
      return result.data;
    }
    return eventsRepository.findByOrganizer(organizerId, query);
  }

  async createEvent(organizerId, body, role = "organizer") {
    const data = createEventSchema.parse(body);
    const finalOrganizerId =
      role === "admin" &&
      body.organizer_id !== undefined &&
      body.organizer_id !== ""
        ? data.organizer_id
        : organizerId;
    console.log(
      "[SERVICE CREATE EVENT] role=",
      role,
      "body=",
      body,
      "parsedOrganizerId=",
      data.organizer_id,
      "finalOrganizerId=",
      finalOrganizerId,
    );
    return eventsRepository.create({ ...data, organizer_id: finalOrganizerId });
  }

  async updateEvent(id, organizerId, body, role) {
    const data = updateEventSchema.parse(body);
    let updated;

    if (role === "admin") {
      updated = await eventsRepository.updateById(id, data);
    } else {
      updated = await eventsRepository.update(id, organizerId, data);
    }

    if (!updated) {
      const err = new Error("Event not found or permission denied");
      err.status = 404;
      throw err;
    }
    return updated;
  }

  async publishEvent(id, organizerId, role) {
    const event = await eventsRepository.findById(id);
    if (!event) {
      const err = new Error("Event not found");
      err.status = 404;
      throw err;
    }
    if (role !== "admin" && event.organizer_id !== organizerId) {
      const err = new Error("Forbidden");
      err.status = 403;
      throw err;
    }
    return eventsRepository.updateStatus(id, "published");
  }

  async cancelEvent(id, organizerId, role) {
    const event = await eventsRepository.findById(id);
    if (!event) {
      const err = new Error("Event not found");
      err.status = 404;
      throw err;
    }
    if (role !== "admin" && event.organizer_id !== organizerId) {
      const err = new Error("Forbidden");
      err.status = 403;
      throw err;
    }
    return eventsRepository.updateStatus(id, "cancelled");
  }

  async deleteEvent(id, organizerId, role) {
    const hasTickets = await eventsRepository.hasTickets(id);

    if (hasTickets) {
      const err = new Error("Cannot delete event with attendees");
      err.status = 400;
      throw err;
    }

    if (role === "admin") {
      return eventsRepository.deleteById(id);
    }

    return eventsRepository.delete(id, organizerId);
  }
}

module.exports = new EventsService();
