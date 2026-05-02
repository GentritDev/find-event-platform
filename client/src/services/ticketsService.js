import api from '../lib/api'

export const ticketsService = {
  getMyTickets: async () => {
    const res = await api.get('/tickets/my')
    return res.data
  },

  verifyTicket: async (qr_token) => {
    const res = await api.post('/tickets/verify', { qr_token })
    return res.data
  },

  getEventTickets: async (eventId) => {
    const res = await api.get(`/tickets/event/${eventId}`)
    return res.data
  },
}
