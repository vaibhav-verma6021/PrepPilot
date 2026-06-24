import api from './axios'

export const getProfile  = ()     => api.get('/api/placement-buddy/profile')
export const setupProfile = (data) => api.post('/api/placement-buddy/setup', data)
export const sendMessage  = (data) => api.post('/api/placement-buddy/chat', data)
export const getHistory   = ()     => api.get('/api/placement-buddy/history')
export const resetChat    = ()     => api.delete('/api/placement-buddy/reset')
