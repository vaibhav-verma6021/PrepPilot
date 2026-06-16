import api from './axios'

export const analyzeJobMatch = (formData) =>
  api.post('/api/jobmatch/analyze', formData, { headers: { 'Content-Type': 'multipart/form-data' } })

export const getLatestJobMatch = () => api.get('/api/jobmatch/latest')
