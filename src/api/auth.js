import api from './client'

export const login    = (email, password)         => api.post('/api/auth/login',    { email, password })
export const register = (nombre, email, password) => api.post('/api/auth/register', { nombre, email, password })

// Perfil del cliente autenticado
export const getPerfil      = ()      => api.get('/api/cliente/perfil')
export const updatePerfil   = (data)  => api.put('/api/cliente/perfil',  data)
export const changePassword = (data)  => api.put('/api/cliente/password', data)
