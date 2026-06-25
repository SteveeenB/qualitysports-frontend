import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('qs_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    const isAuthEndpoint = error.config?.url?.includes('/api/auth/')

    if (status === 401 && !isAuthEndpoint) {
      const hadSession = !!localStorage.getItem('qs_token')
      localStorage.removeItem('qs_token')
      localStorage.removeItem('qs_user')
      window.location.href = hadSession ? '/login?razon=sesion_expirada' : '/login'
    }

    return Promise.reject(error)
  }
)

export default api
