<template>
  <q-page class="q-pa-md q-pa-md-lg" style="max-width: 1120px; margin: 0 auto">
    <!-- Hero Banner -->
    <q-card flat bordered class="bg-white q-pa-lg q-mb-lg" style="border-radius: 18px">
      <div class="row items-center q-col-gutter-lg">
        <div class="col-12 col-md-7">
          <q-badge color="secondary" class="q-pa-xs q-mb-sm">
            968-362 Front-end Development • Lab 8
          </q-badge>
          <div class="text-h4 text-weight-bold text-dark heading-font">
            ฝึกวาดภาพตามแบบ พร้อมจับเวลาอัตโนมัติ
          </div>
          <p class="text-body1 text-grey-7 q-mt-sm q-mb-md">
            เลือกหมวดฝึกวาดได้ทั้งรูปทรงเรขาคณิต ท่าทาง (Gesture) หรือเข้าสู่ระบบเพื่ออัปโหลดรูปของคุณเอง
            บันทึก แก้ไข และเปิดเล่นในโหมด Present จับเวลา 30 วิ / 1 นาที / 5 นาที
          </p>
          <div class="row q-gutter-sm">
            <q-btn
              unelevated
              color="primary"
              icon="play_circle"
              label="เริ่มฝึกวาดทันที"
              size="md"
              no-caps
              @click="launchPractice"
            />
            <q-btn
              outline
              color="primary"
              icon="collections_bookmark"
              :label="authStore.isAuthenticated ? 'จัดการ Preset ของฉัน' : 'เข้าสู่ระบบเพื่ออัปโหลดรูป'"
              size="md"
              no-caps
              :to="{ name: authStore.isAuthenticated ? 'presets' : 'login' }"
            />
          </div>
        </div>

        <div class="col-12 col-md-5">
          <q-card flat class="bg-blue-1 q-pa-md" style="border-radius: 14px">
            <div class="text-subtitle1 text-weight-bold text-primary q-mb-sm">
              <q-icon name="tune" class="q-mr-xs" /> ตั้งค่าการฝึกวาดด่วน
            </div>

            <div class="text-caption text-grey-8 q-mb-xs">1. เลือกหมวดภาพอ้างอิง</div>
            <q-option-group
              v-model="selectedMode"
              :options="modeOptions"
              color="primary"
              class="q-mb-md"
            />

            <div class="text-caption text-grey-8 q-mb-xs">2. เลือกเวลาต่อ 1 ภาพ</div>
            <div class="row q-col-gutter-xs">
              <div v-for="t in TIMER_OPTIONS" :key="t.value" class="col-4">
                <q-btn
                  :unelevated="selectedDuration === t.value"
                  :outline="selectedDuration !== t.value"
                  :color="selectedDuration === t.value ? 'secondary' : 'grey-7'"
                  :label="t.shortLabel"
                  class="full-width"
                  no-caps
                  @click="selectedDuration = t.value"
                />
              </div>
            </div>
          </q-card>
        </div>
      </div>
    </q-card>

    <!-- Category Showcase Cards -->
    <div class="text-h6 text-weight-bold heading-font q-mb-md">
      เลือกโหมดการฝึกวาด
    </div>
    <div class="row q-col-gutter-md q-mb-lg">
      <!-- Geometry -->
      <div class="col-12 col-md-4">
        <q-card bordered flat class="studio-card column full-height bg-white">
          <q-img :src="BUILTIN_GEOMETRY[0].imageUrl" height="170px" fit="contain" class="bg-grey-2" />
          <q-card-section class="col">
            <q-badge color="primary" label="4 แบบพื้นฐาน" class="q-mb-xs" />
            <div class="text-h6 heading-font">รูปทรงเรขาคณิต</div>
            <div class="text-body2 text-grey-7 q-mt-xs">
              ฝึกวาดทรงกลม ลูกบาศก์ ทรงกระบอก ทรงกรวย และพีระมิด เพื่อเข้าใจโครงสร้างและแสงเงา
            </div>
          </q-card-section>
          <q-card-actions class="q-pa-md q-pt-none">
            <q-btn
              unelevated
              color="primary"
              icon="play_arrow"
              label="ฝึกวาดรูปทรง"
              class="full-width"
              no-caps
              @click="startCategory('geometry')"
            />
          </q-card-actions>
        </q-card>
      </div>

      <!-- Pose -->
      <div class="col-12 col-md-4">
        <q-card bordered flat class="studio-card column full-height bg-white">
          <q-img :src="BUILTIN_POSES[0].imageUrl" height="170px" fit="contain" class="bg-grey-2" />
          <q-card-section class="col">
            <q-badge color="secondary" label="4 ท่าทางพื้นฐาน" class="q-mb-xs" />
            <div class="text-h6 heading-font">ท่าทาง (Pose & Gesture)</div>
            <div class="text-body2 text-grey-7 q-mt-xs">
              ฝึกจับเส้นเคลื่อนไหว (Line of Action) ท่ายืน วิ่ง นั่ง และกระโดด เหมาะกับโหมด 30 วินาที
            </div>
          </q-card-section>
          <q-card-actions class="q-pa-md q-pt-none">
            <q-btn
              unelevated
              color="secondary"
              icon="play_arrow"
              label="ฝึกวาดท่าทาง"
              class="full-width"
              no-caps
              @click="startCategory('pose')"
            />
          </q-card-actions>
        </q-card>
      </div>

      <div class="col-12 col-md-4">
        <q-card bordered flat class="studio-card column full-height bg-white">
          <div class="bg-orange-1 flex flex-center column" style="height: 170px">
            <q-icon name="add_photo_alternate" size="64px" color="accent" />
            <div class="text-caption text-orange-10 q-mt-xs">
              {{ authStore.isAuthenticated ? `บันทึกไว้แล้ว ${presetStore.totalPresets} ภาพ` : 'เฉพาะสมาชิกที่เข้าสู่ระบบ' }}
            </div>
          </div>
          <q-card-section class="col">
            <q-badge color="accent" text-color="dark" label="Custom Preset" class="q-mb-xs" />
            <div class="text-h6 heading-font">รูปอัปโหลดของฉัน</div>
            <div class="text-body2 text-grey-7 q-mt-xs">
              อัปโหลดรูปอ้างอิงของคุณเอง บันทึกลง Cloud API แก้ไข ลบ และเปิดฝึกวาดแบบ Present ได้ทุกเมื่อ
            </div>
          </q-card-section>
          <q-card-actions class="q-pa-md q-pt-none">
            <q-btn
              unelevated
              color="accent"
              text-color="dark"
              :icon="authStore.isAuthenticated ? 'collections_bookmark' : 'lock'"
              :label="authStore.isAuthenticated ? 'ไปที่ Preset ของฉัน' : 'เข้าสู่ระบบเพื่อใช้งาน'"
              class="full-width text-weight-bold"
              no-caps
              :to="{ name: 'presets' }"
            />
          </q-card-actions>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuthStore } from '@/stores/auth-store'
import { usePresetStore } from '@/stores/preset-store'
import {
  BUILTIN_GEOMETRY,
  BUILTIN_POSES,
  TIMER_OPTIONS,
} from '@/data/builtInReferences'

const router = useRouter()
const $q = useQuasar()
const authStore = useAuthStore()
const presetStore = usePresetStore()

const selectedMode = ref('geometry')
const selectedDuration = ref(60)

const modeOptions = [
  { label: 'รูปทรงเรขาคณิต (4 ภาพ)', value: 'geometry' },
  { label: 'ท่าทาง Pose / Gesture (4 ภาพ)', value: 'pose' },
  { label: 'Preset ที่ฉันอัปโหลดไว้ (ต้อง Login)', value: 'custom' },
]

onMounted(() => {
  if (authStore.isAuthenticated && presetStore.presets.length === 0) {
    presetStore.fetchPresets()
  }
})

const startCategory = (category) => {
  const images = presetStore.getBuiltInByCategory(category)
  const title = category === 'pose' ? 'ฝึกวาดท่าทาง (Pose & Gesture)' : 'ฝึกวาดรูปทรงเรขาคณิต'
  presetStore.startSession({
    title,
    images,
    duration: selectedDuration.value,
  })
  router.push({ name: 'practice' })
}

const launchPractice = async () => {
  if (selectedMode.value === 'custom') {
    if (!authStore.isAuthenticated) {
      $q.notify({
        type: 'warning',
        icon: 'lock',
        message: 'กรุณาเข้าสู่ระบบก่อนใช้งาน Preset ที่อัปโหลดเอง',
      })
      router.push({ name: 'login', query: { redirect: '/presets' } })
      return
    }
    if (presetStore.presets.length === 0) {
      await presetStore.fetchPresets()
    }
    if (presetStore.presets.length === 0) {
      $q.notify({
        type: 'info',
        message: 'คุณยังไม่มี Preset ที่บันทึกไว้ กำลังพาไปหน้าเพิ่มรูปภาพ',
      })
      router.push({ name: 'presets' })
      return
    }
    presetStore.startSession({
      title: 'Preset ของฉัน (Present Mode)',
      images: presetStore.presets,
      duration: selectedDuration.value,
    })
    router.push({ name: 'practice' })
    return
  }

  startCategory(selectedMode.value)
}
</script>
