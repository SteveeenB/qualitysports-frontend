import api from './client'

export const login    = (email, password)         => api.post('/api/auth/login',    { email, password })
export const register = (nombre, email, password) => api.post('/api/auth/register', { nombre, email, password })
