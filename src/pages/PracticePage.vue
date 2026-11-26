<template>
  <q-page class="q-pa-sm q-pa-md-md bg-grey-10 text-white column" style="min-height: calc(100vh - 50px)">
    <div class="row items-center justify-between q-col-gutter-xs q-mb-sm">
      <div class="col-12 col-md-4 row items-center no-wrap">
        <q-btn flat round dense icon="arrow_back" color="white" @click="router.push({ name: 'home' })" />
        <div class="q-ml-xs ellipsis">
          <div class="text-subtitle2 text-weight-bold heading-font ellipsis">
            {{ presetStore.sessionTitle }}
          </div>
          <div class="text-caption text-grey-4 ellipsis">
            ภาพที่ {{ currentIndex + 1 }} / {{ queue.length }}
            <span v-if="currentItem?.title">• {{ currentItem.title }}</span>
          </div>
        </div>
      </div>

      <div class="col-7 col-md-4 row justify-start justify-md-center q-gutter-xs">
        <q-btn
          v-for="t in TIMER_OPTIONS"
          :key="t.value"
          :dense="$q.screen.lt.sm"
          :size="$q.screen.lt.sm ? 'sm' : 'md'"
          no-caps
          :unelevated="duration === t.value"
          :outline="duration !== t.value"
          :color="duration === t.value ? 'secondary' : 'grey-5'"
          :label="t.shortLabel"
          class="q-px-sm q-px-md-md"
          @click="changeDuration(t.value)"
        />
      </div>

      <div class="col-5 col-md-4 row justify-end q-gutter-xs">
        <q-btn
          flat
          round
          dense
          :color="isFlipped ? 'accent' : 'grey-4'"
          icon="flip"
          @click="isFlipped = !isFlipped"
        >
          <q-tooltip>กลับภาพซ้าย-ขวา (Flip)</q-tooltip>
        </q-btn>
        <q-btn
          flat
          round
          dense
          :color="isGrayscale ? 'accent' : 'grey-4'"
          icon="contrast"
          @click="isGrayscale = !isGrayscale"
        >
          <q-tooltip>โหมดขาวดำ</q-tooltip>
        </q-btn>
        <q-btn
          flat
          round
          dense
          :color="showGrid ? 'accent' : 'grey-4'"
          icon="grid_on"
          @click="showGrid = !showGrid"
        >
          <q-tooltip>ตาราง 3x3</q-tooltip>
        </q-btn>
      </div>
    </div>

    <div class="col row items-center justify-center relative-position q-my-xs">
      <q-card
        flat
        class="bg-grey-9 relative-position flex flex-center overflow-hidden"
        :style="{
          width: '100%',
          maxWidth: '900px',
          height: $q.screen.lt.sm ? '48vh' : '56vh',
          minHeight: '260px',
          borderRadius: '14px',
        }"
      >
        <img
          v-if="currentItem"
          :src="currentItem.imageUrl"
          :alt="currentItem.title || 'reference'"
          class="full-height full-width"
          style="object-fit: contain; transition: transform 0.25s ease, filter 0.25s ease"
          :class="{
            'flip-horizontal': isFlipped,
            'grayscale-filter': isGrayscale,
          }"
        />

        <div v-if="showGrid" class="grid-overlay pointer-events-none">
          <div class="grid-v-1" />
          <div class="grid-v-2" />
          <div class="grid-h-1" />
          <div class="grid-h-2" />
        </div>

        <div
          v-if="!isRunning && timeLeft > 0"
          class="absolute-full flex flex-center"
          style="background: rgba(15, 23, 42, 0.45)"
        >
          <q-btn
            round
            size="lg"
            color="secondary"
            icon="play_arrow"
            @click="toggleTimer"
          />
        </div>
      </q-card>
    </div>

    <q-card
      flat
      class="bg-grey-9 q-pa-sm q-pa-md-md q-mt-xs"
      style="max-width: 900px; width: 100%; margin: 0 auto; border-radius: 14px"
    >
      <q-linear-progress
        :value="progressRatio"
        :color="timeLeft <= 10 ? 'negative' : 'secondary'"
        track-color="grey-8"
        size="8px"
        rounded
        class="q-mb-sm"
      />

      <div class="row items-center justify-between q-col-gutter-sm">
        <div class="col-12 col-sm-4 row items-center justify-center justify-sm-start q-gutter-sm">
          <q-icon
            name="timer"
            size="26px"
            :color="timeLeft <= 10 ? 'negative' : 'secondary'"
          />
          <div class="text-center text-sm-left">
            <div
              class="text-h5 text-weight-bold heading-font"
              :class="timeLeft <= 10 ? 'text-red-4' : 'text-white'"
            >
              {{ formattedTime }}
            </div>
            <div v-if="currentItem?.notes" class="text-caption text-grey-4 gt-xs">
              {{ currentItem.notes }}
            </div>
          </div>
        </div>

        <div class="col-12 col-sm-8 row justify-center justify-sm-end items-center q-gutter-xs">
          <q-btn
            outline
            :dense="$q.screen.xs"
            color="grey-4"
            icon="skip_previous"
            :label="$q.screen.gt.xs ? 'ก่อนหน้า' : ''"
            no-caps
            :disable="currentIndex === 0"
            @click="prevSlide"
          />
          <q-btn
            unelevated
            :dense="$q.screen.xs"
            :color="isRunning ? 'warning' : 'secondary'"
            :icon="isRunning ? 'pause' : 'play_arrow'"
            :label="isRunning ? 'พักเวลา' : 'เริ่ม'"
            no-caps
            class="q-px-md"
            @click="toggleTimer"
          />
          <q-btn
            outline
            :dense="$q.screen.xs"
            color="grey-4"
            icon="replay"
            :label="$q.screen.gt.xs ? 'รีเซ็ต' : ''"
            no-caps
            @click="resetCurrentTimer"
          />
          <q-btn
            unelevated
            :dense="$q.screen.xs"
            color="primary"
            icon-right="skip_next"
            :label="$q.screen.gt.xs ? 'ภาพถัดไป' : 'ถัดไป'"
            no-caps
            class="q-px-sm"
            @click="nextSlide"
          />
        </div>
      </div>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { usePresetStore } from '@/stores/preset-store'
import { TIMER_OPTIONS } from '@/data/builtInReferences'

const router = useRouter()
const $q = useQuasar()
const presetStore = usePresetStore()

const queue = computed(() => presetStore.sessionQueue)
const currentIndex = ref(0)
const duration = ref(presetStore.selectedDuration || 60)
const timeLeft = ref(duration.value)
const isRunning = ref(true)
const isFlipped = ref(false)
const isGrayscale = ref(false)
const showGrid = ref(false)

let timerInterval = null

const currentItem = computed(() => queue.value[currentIndex.value] || null)

const progressRatio = computed(() => {
  if (!duration.value) return 0
  return timeLeft.value / duration.value
})

const formattedTime = computed(() => {
  const mins = Math.floor(timeLeft.value / 60)
  const secs = timeLeft.value % 60
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
})

const stopInterval = () => {
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
}

const startInterval = () => {
  stopInterval()
  timerInterval = setInterval(() => {
    if (!isRunning.value) return
    if (timeLeft.value > 1) {
      timeLeft.value -= 1
    } else {
      timeLeft.value = 0
      if (currentIndex.value < queue.value.length - 1) {
        currentIndex.value += 1
        timeLeft.value = duration.value
        $q.notify({
          type: 'info',
          icon: 'navigate_next',
          message: `หมดเวลา! เปลี่ยนเป็นภาพที่ ${currentIndex.value + 1}`,
          timeout: 1500,
        })
      } else {
        isRunning.value = false
        stopInterval()
        $q.notify({
          type: 'positive',
          icon: 'emoji_events',
          message: 'ฝึกวาดครบทุกภาพในชุดนี้แล้ว! เยี่ยมมาก',
          timeout: 3500,
        })
      }
    }
  }, 1000)
}

const toggleTimer = () => {
  if (timeLeft.value === 0) {
    timeLeft.value = duration.value
  }
  isRunning.value = !isRunning.value
  if (isRunning.value && !timerInterval) {
    startInterval()
  }
}

const changeDuration = (newSec) => {
  duration.value = newSec
  presetStore.selectedDuration = newSec
  timeLeft.value = newSec
  isRunning.value = true
  startInterval()
}

const resetCurrentTimer = () => {
  timeLeft.value = duration.value
  isRunning.value = true
  startInterval()
}

const prevSlide = () => {
  if (currentIndex.value > 0) {
    currentIndex.value -= 1
    timeLeft.value = duration.value
  }
}

const nextSlide = () => {
  if (currentIndex.value < queue.value.length - 1) {
    currentIndex.value += 1
    timeLeft.value = duration.value
  } else {
    currentIndex.value = 0
    timeLeft.value = duration.value
  }
}

onMounted(() => {
  startInterval()
})

onUnmounted(() => {
  stopInterval()
})
</script>

<style scoped>
.grid-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.grid-v-1,
.grid-v-2 {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 1px;
  background: rgba(244, 162, 97, 0.65);
}
.grid-v-1 { left: 33.33%; }
.grid-v-2 { left: 66.66%; }
.grid-h-1,
.grid-h-2 {
  position: absolute;
  left: 0;
  right: 0;
  height: 1px;
  background: rgba(244, 162, 97, 0.65);
}
.grid-h-1 { top: 33.33%; }
.grid-h-2 { top: 66.66%; }
</style>
