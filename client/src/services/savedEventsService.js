import api from "../lib/api";

export const savedEventsService = {
  getSavedEvents: async () => {
    const res = await api.get("/saved-events");
    return res;
  },

  saveEvent: async (eventId) => {
    const res = await api.post(`/saved-events/${eventId}`);
    return res;
  },

  unsaveEvent: async (eventId) => {
    const res = await api.delete(`/saved-events/${eventId}`);
    return res;
  },
};
