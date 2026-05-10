import api from '../lib/api'

export const paymentsService = {
  createPayPalOrder: async (data) => {
    return api.post('/payments/paypal/create-order', data)
  },

  capturePayPalOrder: async (data) => {
    return api.post('/payments/paypal/capture-order', data)
  },

  createFreeTicket: async (data) => {
    return api.post('/payments/create-free-ticket', data)
  },

  getUserOrders: async () => {
    return api.get('/payments/orders')
  },
}
