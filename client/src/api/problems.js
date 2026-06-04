import api from './axios'

export const getProblems    = (params) => api.get('/api/problems', { params })
export const createProblem  = (data)   => api.post('/api/problems', data)
export const updateProblem  = (id, data) => api.put(`/api/problems/${id}`, data)
export const toggleDone     = (id)     => api.patch(`/api/problems/${id}/done`)
export const toggleRevision = (id)     => api.patch(`/api/problems/${id}/revision`)
export const deleteProblem  = (id)     => api.delete(`/api/problems/${id}`)
