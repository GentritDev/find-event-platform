import api from '../lib/api'

export const uploadsService = {
  uploadImage: async (file) => {
    const formData = new FormData()
    formData.append('image', file)
    const res = await api.post('/uploads/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return res.data
  },
}
