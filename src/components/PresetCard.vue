<template>
  <q-card bordered flat class="studio-card column full-height bg-white">
    <div class="relative-position bg-grey-2" style="height: 200px; overflow: hidden">
      <q-img
        :src="coverImage"
        :alt="preset.title"
        fit="contain"
        class="full-height full-width"
      >
        <template #error>
          <div class="absolute-full flex flex-center bg-grey-3 text-grey-7 column">
            <q-icon name="broken_image" size="40px" />
            <div class="text-caption q-mt-xs">โหลดรูปภาพไม่สำเร็จ</div>
          </div>
        </template>
      </q-img>

      <q-badge
        :color="categoryMeta.color"
        class="absolute-top-left q-ma-sm q-pa-xs text-weight-medium"
      >
        <q-icon :name="categoryMeta.icon" size="14px" class="q-mr-xs" />
        {{ categoryMeta.label }}
      </q-badge>

      <q-badge
        color="dark"
        class="absolute-top-right q-ma-sm q-pa-xs"
      >
        <q-icon name="timer" size="14px" class="q-mr-xs" />
        {{ formatDuration(preset.duration) }}
      </q-badge>

      <q-badge
        v-if="imageList.length > 1"
        color="primary"
        class="absolute-bottom-right q-ma-sm q-pa-xs"
      >
        <q-icon name="collections" size="14px" class="q-mr-xs" />
        {{ imageList.length }} รูป
      </q-badge>
    </div>

    <q-card-section class="col">
      <div class="text-subtitle1 text-weight-bold ellipsis">
        {{ preset.title }}
      </div>
      <div class="text-caption text-grey-7 q-mt-xs">
        {{ preset.notes || 'ไม่มีหมายเหตุเพิ่มเติม' }}
      </div>
    </q-card-section>

    <q-separator />

    <q-card-actions align="between" class="q-px-md q-py-sm">
      <q-btn
        unelevated
        dense
        color="secondary"
        icon="play_arrow"
        :label="imageList.length > 1 ? `Present (${imageList.length})` : 'Present'"
        no-caps
        class="q-px-sm"
        @click="$emit('present', preset)"
      />
      <div class="row q-gutter-xs">
        <q-btn
          flat
          round
          dense
          color="primary"
          icon="edit"
          @click="$emit('edit', preset)"
        >
          <q-tooltip>แก้ไข Preset</q-tooltip>
        </q-btn>
        <q-btn
          flat
          round
          dense
          color="negative"
          icon="delete_outline"
          @click="$emit('delete', preset)"
        >
          <q-tooltip>ลบ Preset</q-tooltip>
        </q-btn>
      </div>
    </q-card-actions>
  </q-card>
</template>

<script setup>
import { computed } from 'vue'
import { CATEGORY_OPTIONS } from '@/data/builtInReferences'
import { parsePresetImages } from '@/utils/imageCompressor'

const props = defineProps({
  preset: {
    type: Object,
    required: true,
  },
})

defineEmits(['present', 'edit', 'delete'])

const imageList = computed(() => parsePresetImages(props.preset))
const coverImage = computed(() => imageList.value[0] || '')

const categoryMeta = computed(() => {
  return (
    CATEGORY_OPTIONS.find((item) => item.value === props.preset.category) || {
      label: 'อัปโหลดเอง',
      icon: 'collections',
      color: 'accent',
    }
  )
})

const formatDuration = (seconds) => {
  const sec = Number(seconds) || 60
  if (sec < 60) return `${sec} วิ`
  return `${sec / 60} นาที`
}
</script>
