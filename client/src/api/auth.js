import api from './axios'

export const signup         = (data) => api.post('/api/auth/signup', data)
export const login          = (data) => api.post('/api/auth/login', data)
export const getMe          = ()     => api.get('/api/auth/me')
export const updateProfile  = (data) => api.patch('/api/auth/profile', data)
export const changePassword = (data) => api.patch('/api/auth/password', data)
