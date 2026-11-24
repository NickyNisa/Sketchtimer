<template>
  <q-page class="q-pa-md q-pa-md-lg" style="max-width: 1120px; margin: 0 auto">
    <!-- Page Header -->
    <div class="row items-center justify-between q-col-gutter-md q-mb-md">
      <div class="col-12 col-md-7">
        <div class="text-h5 text-weight-bold heading-font text-dark">
          Preset ภาพวาดของฉัน ({{ filteredPresets.length }})
        </div>
        <div class="text-body2 text-grey-7">
          อัปโหลดรูปอ้างอิง บันทึก แก้ไข ลบ และกดเปิด Present จับเวลาได้ทันที
        </div>
      </div>

      <div class="col-12 col-md-5 row justify-end q-gutter-sm">
        <q-btn
          outline
          color="secondary"
          icon="slideshow"
          label="Present ทั้งหมด"
          no-caps
          :disable="filteredPresets.length === 0"
          @click="presentAllFiltered"
        />
        <q-btn
          unelevated
          color="primary"
          icon="add_photo_alternate"
          label="เพิ่ม Preset ใหม่"
          no-caps
          @click="openCreateDialog"
        />
      </div>
    </div>

    <q-card flat bordered class="bg-white q-pa-md q-mb-lg" style="border-radius: 14px">
      <div class="row q-col-gutter-md items-center">
        <div class="col-12 col-sm-6">
          <q-input
            v-model="searchText"
            outlined
            dense
            clearable
            placeholder="ค้นหาชื่อ Preset หรือหมายเหตุ..."
          >
            <template #prepend>
              <q-icon name="search" color="primary" />
            </template>
          </q-input>
        </div>

        <div class="col-12 col-sm-4">
          <q-select
            v-model="filterCategory"
            outlined
            dense
            emit-value
            map-options
            label="กรองตามหมวดหมู่"
            :options="filterCategoryOptions"
          />
        </div>

        <div class="col-12 col-sm-2">
          <q-btn
            flat
            color="primary"
            icon="refresh"
            label="รีเฟรช"
            class="full-width"
            no-caps
            :loading="presetStore.loading"
            @click="presetStore.fetchPresets()"
          />
        </div>
      </div>
    </q-card>

    <q-banner
      v-if="presetStore.errorMessage"
      rounded
      class="bg-red-1 text-negative q-mb-md"
    >
      <template #avatar>
        <q-icon name="error" color="negative" />
      </template>
      {{ presetStore.errorMessage }}

    </q-banner>
    <div v-if="presetStore.loading && presetStore.presets.length === 0" class="flex flex-center q-pa-xl column">
      <q-spinner-dots color="primary" size="48px" />
      <div class="text-grey-7 q-mt-sm">กำลังโหลด Preset จากเซิร์ฟเวอร์...</div>
    </div>

    <q-card
      v-else-if="filteredPresets.length === 0"
      flat
      bordered
      class="bg-white text-center q-pa-xl"
      style="border-radius: 16px"
    >
      <q-icon name="collections" size="64px" color="grey-5" />
      <div class="text-h6 heading-font text-grey-8 q-mt-sm">
        ยังไม่มี Preset ภาพวาดในรายการนี้
      </div>
      <div class="text-body2 text-grey-6 q-mb-md">
        เริ่มอัปโหลดรูปภาพของคุณเองเพื่อสร้างชุดฝึกวาดแบบ Present
      </div>
      <q-btn
        unelevated
        color="primary"
        icon="add_photo_alternate"
        label="เพิ่ม Preset แรกของคุณ"
        no-caps
        @click="openCreateDialog"
      />
    </q-card>

    <div v-else class="row q-col-gutter-md">
      <div
        v-for="item in filteredPresets"
        :key="item.id"
        class="col-12 col-sm-6 col-md-4"
      >
        <PresetCard
          :preset="item"
          @present="presentSingle"
          @edit="openEditDialog"
          @delete="confirmDelete"
        />
      </div>
    </div>

    <PresetFormDialog
      v-model="dialogOpen"
      :editing-preset="editingPreset"
      :submitting="presetStore.loading"
      @save="handleSavePreset"
    />
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { usePresetStore } from '@/stores/preset-store'
import { useAuthStore } from '@/stores/auth-store'
import { CATEGORY_OPTIONS } from '@/data/builtInReferences'
import PresetCard from '@/components/PresetCard.vue'
import PresetFormDialog from '@/components/PresetFormDialog.vue'

const router = useRouter()
const $q = useQuasar()
const presetStore = usePresetStore()
const authStore = useAuthStore()

const searchText = ref('')
const filterCategory = ref('all')
const dialogOpen = ref(false)
const editingPreset = ref(null)

const filterCategoryOptions = [
  { label: 'ทุกหมวดหมู่', value: 'all' },
  ...CATEGORY_OPTIONS.map((c) => ({ label: c.label, value: c.value })),
]

const filteredPresets = computed(() => {
  return presetStore.presets.filter((item) => {
    const matchCategory =
      filterCategory.value === 'all' || item.category === filterCategory.value
    const keyword = (searchText.value || '').trim().toLowerCase()
    const matchSearch =
      !keyword ||
      (item.title || '').toLowerCase().includes(keyword) ||
      (item.notes || '').toLowerCase().includes(keyword)
    return matchCategory && matchSearch
  })
})

onMounted(() => {
  presetStore.fetchPresets()
})

const openCreateDialog = () => {
  editingPreset.value = null
  dialogOpen.value = true
}

const openEditDialog = (preset) => {
  editingPreset.value = { ...preset }
  dialogOpen.value = true
}

const handleSavePreset = async ({ id, payload }) => {
  const dataWithOwner = {
    ...payload,
    owner: authStore.user?.username || 'artist',
  }
  try {
    if (id) {
      await presetStore.updatePreset(id, dataWithOwner)
      $q.notify({
        type: 'positive',
        icon: 'check_circle',
        message: 'บันทึกการแก้ไข Preset เรียบร้อยแล้ว',
      })
    } else {
      await presetStore.createPreset(dataWithOwner)
      $q.notify({
        type: 'positive',
        icon: 'cloud_done',
        message: 'เพิ่ม Preset ใหม่ลงระบบเรียบร้อยแล้ว',
      })
    }
    dialogOpen.value = false
  } catch {
    $q.notify({
      type: 'negative',
      icon: 'error',
      message: presetStore.errorMessage || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล',
    })
  }
}

const confirmDelete = (preset) => {
  $q.dialog({
    title: 'ยืนยันการลบ Preset',
    message: `คุณต้องการลบ "${preset.title}" ออกจากรายการใช่หรือไม่?`,
    cancel: { label: 'ยกเลิก', flat: true, color: 'grey-7' },
    ok: { label: 'ลบข้อมูล', color: 'negative', unelevated: true },
    persistent: true,
  }).onOk(async () => {
    try {
      await presetStore.deletePreset(preset.id)
      $q.notify({
        type: 'positive',
        icon: 'delete',
        message: `ลบ "${preset.title}" เรียบร้อยแล้ว`,
      })
    } catch {
      $q.notify({
        type: 'negative',
        message: presetStore.errorMessage || 'ไม่สามารถลบข้อมูลได้',
      })
    }
  })
}

const presentSingle = (preset) => {
  presetStore.startSession({
    title: `Present: ${preset.title}`,
    images: [preset],
    duration: Number(preset.duration) || 60,
  })
  router.push({ name: 'practice' })
}

const presentAllFiltered = () => {
  if (filteredPresets.value.length === 0) return
  presetStore.startSession({
    title: `Preset ของฉัน (${filteredPresets.value.length} ภาพ)`,
    images: filteredPresets.value,
    duration: Number(filteredPresets.value[0].duration) || 60,
  })
  router.push({ name: 'practice' })
}
</script>
