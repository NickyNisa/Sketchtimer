import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from '@/boot/axios'

export const useAuthStore = defineStore(
  'auth',
  () => {
    const user = ref(null)
    const accessToken = ref(null)
    const loading = ref(false)
    const errorMessage = ref('')

    const isAuthenticated = computed(() => Boolean(accessToken.value && user.value))
    const displayName = computed(() => user.value?.name || user.value?.username || 'ผู้เยี่ยมชม')

    const isApiConfigured = () => {
      const url = import.meta.env.QCLI_API_URL || ''
      return Boolean(url && !url.includes('YOUR_PROJECT_ID'))
    }

    const login = async (username, password) => {
      loading.value = true
      errorMessage.value = ''
      try {
        if (!isApiConfigured()) {
          throw new Error(
            'ยังไม่ได้ตั้งค่า QCLI_API_URL ในไฟล์ .env กรุณานำ Endpoint จาก MockAPI.io มาใส่ก่อนใช้งาน'
          )
        }

        const response = await api.get('/users')
        const users = Array.isArray(response.data) ? response.data : []
        const matchedUser = users.find(
          (item) =>
            item.username?.toLowerCase() === username.trim().toLowerCase() &&
            String(item.password) === String(password)
        )

        if (!matchedUser) {
          throw new Error('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง')
        }

        user.value = {
          id: matchedUser.id,
          username: matchedUser.username,
          name: matchedUser.name || matchedUser.username,
          role: matchedUser.role || 'artist',
        }
        accessToken.value = `mock-jwt-${matchedUser.id}-${Date.now()}`
        return user.value
      } catch (error) {
        if (error.response) {
          errorMessage.value = `Server Error (${error.response.status}): ตรวจสอบว่าสร้าง Resource ชื่อ users บน MockAPI แล้ว`
        } else if (error.request) {
          errorMessage.value = 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ MockAPI ได้'
        } else {
          errorMessage.value = error.message || 'ไม่สามารถเข้าสู่ระบบได้'
        }
        throw error
      } finally {
        loading.value = false
      }
    }

    const register = async ({ name, username, password }) => {
      loading.value = true
      errorMessage.value = ''
      try {
        if (!isApiConfigured()) {
          throw new Error(
            'ยังไม่ได้ตั้งค่า QCLI_API_URL ในไฟล์ .env กรุณานำ Endpoint จาก MockAPI.io มาใส่ก่อนใช้งาน'
          )
        }

        const existingRes = await api.get('/users')
        const existingUsers = Array.isArray(existingRes.data) ? existingRes.data : []
        const isDuplicate = existingUsers.some(
          (item) => item.username?.toLowerCase() === username.trim().toLowerCase()
        )
        if (isDuplicate) {
          throw new Error('ชื่อผู้ใช้นี้มีอยู่ในระบบแล้ว กรุณาใช้ชื่ออื่น')
        }

        const response = await api.post('/users', {
          name: name.trim(),
          username: username.trim(),
          password: String(password),
          role: 'artist',
        })

        const created = response.data
        user.value = {
          id: created.id,
          username: created.username,
          name: created.name || created.username,
          role: created.role || 'artist',
        }
        accessToken.value = `mock-jwt-${created.id}-${Date.now()}`
        return user.value
      } catch (error) {
        if (error.response) {
          errorMessage.value = `Server Error (${error.response.status}): ไม่สามารถสร้างบัญชีบน MockAPI ได้`
        } else if (error.request) {
          errorMessage.value = 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ MockAPI ได้'
        } else {
          errorMessage.value = error.message || 'ไม่สามารถสมัครสมาชิกได้'
        }
        throw error
      } finally {
        loading.value = false
      }
    }

    const logout = () => {
      user.value = null
      accessToken.value = null
      errorMessage.value = ''
    }

    return {
      user,
      accessToken,
      loading,
      errorMessage,
      isAuthenticated,
      displayName,
      login,
      register,
      logout,
    }
  },
  {
    persist: {
      pick: ['user', 'accessToken'],
    },
  }
)
