import api from '../lib/api'

export const eventsService = {
  getEvents: async (params = {}) => {
    const res = await api.get('/events', { params })
    return res
  },

  getEvent: async (id) => {
    const res = await api.get(`/events/${id}`)
    return res.data
  },

  getOrganizerEvents: async () => {
    const res = await api.get('/events/organizer/mine')
    return res.data
  },

  createEvent: async (data) => {
    const res = await api.post('/events', data)
    return res.data
  },

  updateEvent: async (id, data) => {
    const res = await api.put(`/events/${id}`, data)
    return res.data
  },

  publishEvent: async (id) => {
    const res = await api.patch(`/events/${id}/publish`)
    return res.data
  },

  cancelEvent: async (id) => {
    const res = await api.patch(`/events/${id}/cancel`)
    return res.data
  },

  deleteEvent: async (id) => {
    const res = await api.delete(`/events/${id}`)
    return res
  },
}
