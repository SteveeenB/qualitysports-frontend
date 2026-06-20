import api from './client'

export const buscarCiudad  = (label)          => api.get('/api/heka/ciudades', { params: { label } })
export const getDefaults   = ()               => api.get('/api/heka/defaults')
export const cotizarEnvio  = (data)           => api.post('/api/heka/cotizar', data)
export const generarGuia   = (pedidoId, data) => api.post(`/api/heka/guia/${pedidoId}`, data)
