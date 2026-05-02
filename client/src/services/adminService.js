import api from '../lib/api'

export const adminService = {
  getDashboard: async () => {
    const res = await api.get('/admin/dashboard')
    return res.data
  },

  getAllUsers: async (params = {}) => {
    const res = await api.get('/admin/users', { params })
    return res
  },

  updateUserRole: async (id, role) => {
    const res = await api.patch(`/admin/users/${id}/role`, { role })
    return res.data
  },

  getAllEvents: async (params = {}) => {
    const res = await api.get('/admin/events', { params })
    return res
  },

  getRevenue: async () => {
    const res = await api.get('/admin/revenue')
    return res.data
  },
}
