import { defineBoot } from '#q-app/wrappers'
import axios from 'axios'
import { useAuthStore } from '@/stores/auth-store'

const api = axios.create({
  baseURL: import.meta.env.QCLI_API_URL || 'https://YOUR_PROJECT_ID.mockapi.io/api',
})
api.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore()
    config.headers['Content-Type'] = 'application/json; charset=UTF-8'
    if (authStore.accessToken) {
      config.headers['Authorization'] = `Bearer ${authStore.accessToken}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

export default defineBoot(({ app }) => {
  app.config.globalProperties.$axios = axios
  app.config.globalProperties.$api = api
})

export { api }
