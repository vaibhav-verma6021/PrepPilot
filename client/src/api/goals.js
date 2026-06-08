import api from './axios'

export const getGoals = () => api.get('/api/goals')
export const createGoal = (data) => api.post('/api/goals', data)
export const toggleGoal = (id) => api.patch(`/api/goals/${id}`)
export const deleteGoal = (id) => api.delete(`/api/goals/${id}`)
