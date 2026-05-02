import api from '../lib/api'

export const notificationsService = {
  getMyNotifications: async () => {
    const res = await api.get('/notifications/me')
    return res.data
  },

  getUnreadCount: async () => {
    const res = await api.get('/notifications/unread-count')
    return res.data
  },

  markRead: async (id) => {
    const res = await api.patch(`/notifications/${id}/read`)
    return res.data
  },

  markAllRead: async () => {
    const res = await api.patch('/notifications/read-all')
    return res
  },
}
