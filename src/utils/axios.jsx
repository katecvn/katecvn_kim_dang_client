import axios from 'axios'
import { toast } from 'sonner'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

const nodeEnv = import.meta.env.VITE_NODE_ENV

const baseURL =
  nodeEnv === 'development'
    ? import.meta.env.VITE_SERVER_API_DEVELOPMENT
    : import.meta.env.VITE_SERVER_API_PRODUCTION

const api = axios.create({ baseURL, timeout: 60000 })

api.interceptors.request.use((config) => {
  NProgress.start()
  const token = localStorage.getItem('accessToken')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  config.headers['ngrok-skip-browser-warning'] = '69420'
  return config
})

api.interceptors.response.use(
  (response) => {
    NProgress.done()
    if (response && response.data.status === 401) {
      localStorage.clear()
      toast.error('Phiên làm việc hết hạn')

      setTimeout(() => {
        window.location.href = '/'
      }, 3000)
      return
    }

    return response
  },
  (error) => {
    NProgress.done()
    if (error.response && error.response.status === 401) {
      localStorage.clear()
      toast.error('Phiên làm việc hết hạn')
      setTimeout(() => {
        window.location.href = '/'
      }, 3000)

      return
    }

    return Promise.reject(error)
  },
)

export default api
