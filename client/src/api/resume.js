import api from './axios'

export const analyzeResume = (formData) =>
  api.post('/api/resume/analyze', formData, { headers: { 'Content-Type': 'multipart/form-data' } })

export const getLatestResume = () => api.get('/api/resume/latest')
