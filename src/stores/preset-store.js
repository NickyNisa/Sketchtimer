import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from '@/boot/axios'
import { BUILTIN_GEOMETRY, BUILTIN_POSES } from '@/data/builtInReferences'

export const usePresetStore = defineStore('presets', () => {
  const presets = ref([])
  const loading = ref(false)
  const errorMessage = ref('')
  const selectedDuration = ref(60)
  const sessionTitle = ref('ฝึกวาดรูปทรงเรขาคณิต')
  const sessionQueue = ref([...BUILTIN_GEOMETRY])
  const totalPresets = computed(() => presets.value.length)
  const extractError = (error, fallback) => {
    if (error.response) {
      return `Server Error (${error.response.status}): ตรวจสอบ Resource "presets" บน MockAPI.io`
    }
    if (error.request) {
      return 'ไม่สามารถเชื่อมต่อกับ API ได้ กรุณาตรวจสอบอินเทอร์เน็ตหรือ QCLI_API_URL ใน .env'
    }
    return error.message || fallback
  }

  const fetchPresets = async () => {
    loading.value = true
    errorMessage.value = ''
    try {
      const response = await api.get('/presets')
      presets.value = Array.isArray(response.data) ? response.data : []
    } catch (error) {
      errorMessage.value = extractError(error, 'ไม่สามารถโหลดข้อมูล Preset ได้')
      console.error('fetchPresets error:', error)
    } finally {
      loading.value = false
    }
  }

  const createPreset = async (payload) => {
    loading.value = true
    errorMessage.value = ''
    try {
      const response = await api.post('/presets', payload)
      presets.value.unshift(response.data)
      return response.data
    } catch (error) {
      errorMessage.value = extractError(error, 'ไม่สามารถบันทึก Preset ใหม่ได้')
      throw error
    } finally {
      loading.value = false
    }
  }

  const updatePreset = async (id, payload) => {
    loading.value = true
    errorMessage.value = ''
    try {
      const response = await api.put(`/presets/${id}`, payload)
      const index = presets.value.findIndex((item) => String(item.id) === String(id))
      if (index !== -1) {
        presets.value[index] = response.data
      }
      return response.data
    } catch (error) {
      errorMessage.value = extractError(error, 'ไม่สามารถแก้ไขข้อมูล Preset ได้')
      throw error
    } finally {
      loading.value = false
    }
  }

  const deletePreset = async (id) => {
    loading.value = true
    errorMessage.value = ''
    try {
      await api.delete(`/presets/${id}`)
      presets.value = presets.value.filter((item) => String(item.id) !== String(id))
    } catch (error) {
      errorMessage.value = extractError(error, 'ไม่สามารถลบ Preset ได้')
      throw error
    } finally {
      loading.value = false
    }
  }

  const startSession = ({ title, images, duration }) => {
    sessionTitle.value = title || 'โหมดฝึกวาดภาพ'
    sessionQueue.value = images && images.length > 0 ? [...images] : [...BUILTIN_GEOMETRY]
    selectedDuration.value = Number(duration) || 60
  }

  const getBuiltInByCategory = (category) => {
    if (category === 'pose') return BUILTIN_POSES
    return BUILTIN_GEOMETRY
  }

  return {
    presets,
    loading,
    errorMessage,
    selectedDuration,
    sessionTitle,
    sessionQueue,
    totalPresets,
    fetchPresets,
    createPreset,
    updatePreset,
    deletePreset,
    startSession,
    getBuiltInByCategory,
  }
})
