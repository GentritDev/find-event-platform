import api from '../lib/api'

export const paymentsService = {
  createPayPalOrder: async (data) => {
    const res = await api.post('/payments/paypal/create-order', data)
    return res.data
  },

  capturePayPalOrder: async (data) => {
    const res = await api.post('/payments/paypal/capture-order', data)
    return res.data
  },

  getUserOrders: async () => {
    const res = await api.get('/payments/orders')
    return res.data
  },
}
