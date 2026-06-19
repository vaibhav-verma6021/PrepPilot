import api from './axios'

export const getCompanies = (params) => api.get('/api/companies', { params })
export const getCompanyByName = (name) => api.get(`/api/companies/${encodeURIComponent(name)}`)
