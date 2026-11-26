<template>
  <q-dialog :model-value="modelValue" persistent @update:model-value="$emit('update:modelValue', $event)">
    <q-card style="width: 100%; max-width: 580px; border-radius: 16px">
      <q-card-section class="row items-center justify-between bg-primary text-white">
        <div class="text-h6 heading-font">
          <q-icon :name="isEditMode ? 'edit' : 'add_photo_alternate'" class="q-mr-sm" />
          {{ isEditMode ? 'แก้ไข Preset ภาพวาด' : 'เพิ่ม Preset ภาพวาดใหม่' }}
        </div>
        <q-btn flat round dense icon="close" v-close-popup />
      </q-card-section>

      <q-card-section class="q-pt-md scroll" style="max-height: 75vh">
        <q-form ref="formRef" class="q-gutter-md">
          <q-input
            v-model="form.title"
            outlined
            dense
            label="ชื่อ Preset / ชื่อชุดแบบวาด *"
            placeholder="เช่น ชุดฝึกวาดรูปปั้น 5 ท่า, รวมรูปทรงเรขาคณิต"
            :rules="[(val) => (val && val.trim().length > 0) || 'กรุณากรอกชื่อ Preset']"
          />

          <div class="row q-col-gutter-sm">
            <div class="col-12 col-sm-6">
              <q-select
                v-model="form.category"
                outlined
                dense
                emit-value
                map-options
                label="หมวดหมู่ *"
                :options="categorySelectOptions"
              />
            </div>
            <div class="col-12 col-sm-6">
              <q-select
                v-model="form.duration"
                outlined
                dense
                emit-value
                map-options
                label="เวลาเริ่มต้นในการวาด *"
                :options="timerSelectOptions"
              />
            </div>
          </div>

          <div>
            <q-btn-toggle
              v-model="imageMode"
              spread
              no-caps
              unelevated
              toggle-color="primary"
              color="grey-2"
              text-color="dark"
              class="q-mb-sm"
              :options="[
                { label: 'อัปโหลดรูปจากเครื่อง (เลือกหลายรูปได้)', value: 'upload', icon: 'upload_file' },
                { label: 'วางลิงก์รูป (URL)', value: 'url', icon: 'link' },
              ]"
            />

            <div v-if="imageMode === 'upload'">
              <q-file
                v-model="selectedFiles"
                outlined
                dense
                multiple
                accept="image/*"
                label="เลือกไฟล์รูปภาพได้พร้อมกันหลายรูป (.jpg, .png, .webp)"
                hint="แนะนำไม่เกิน 6-8 รูปต่อ Preset (ระบบย่อขนาดให้อัตโนมัติเพื่อให้บันทึกลง MockAPI ได้)"
                @update:model-value="handleFilesSelected"
              >
                <template #prepend>
                  <q-icon name="collections" color="primary" />
                </template>
              </q-file>
            </div>

            <div v-else class="row q-col-gutter-xs items-start">
              <div class="col">
                <q-input
                  v-model="urlInput"
                  outlined
                  dense
                  label="URL รูปภาพ"
                  placeholder="https://example.com/reference.jpg"
                  @keyup.enter.prevent="addImageUrl"
                >
                  <template #prepend>
                    <q-icon name="link" color="primary" />
                  </template>
                </q-input>
              </div>
              <div class="col-auto">
                <q-btn
                  unelevated
                  color="secondary"
                  icon="add"
                  label="เพิ่มรูป"
                  no-caps
                  style="height: 40px"
                  @click="addImageUrl"
                />
              </div>
            </div>
          </div>

          <div v-if="form.images.length > 0" class="bg-grey-2 rounded-borders q-pa-sm">
            <div class="row items-center justify-between q-mb-sm">
              <div class="text-caption text-weight-bold text-grey-8">
                รูปภาพใน Preset นี้ ({{ form.images.length }} รูป)
              </div>
              <q-btn
                flat
                dense
                size="xs"
                color="negative"
                icon="delete_sweep"
                label="ล้างรูปทั้งหมด"
                no-caps
                @click="form.images = []"
              />
            </div>

            <div class="row q-col-gutter-sm">
              <div
                v-for="(img, index) in form.images"
                :key="index"
                class="col-4 col-sm-3"
              >
                <div class="relative-position bg-white rounded-borders overflow-hidden shadow-1" style="height: 92px">
                  <q-img :src="img" fit="cover" class="full-height full-width" />
                  <q-badge
                    color="dark"
                    class="absolute-bottom-left q-ma-xs"
                    style="opacity: 0.85"
                  >
                    {{ index + 1 }}
                  </q-badge>
                  <q-btn
                    round
                    dense
                    size="xs"
                    color="negative"
                    icon="close"
                    class="absolute-top-right q-ma-xs"
                    @click="removeImage(index)"
                  />
                </div>
              </div>
            </div>
          </div>

          <q-input
            v-model="form.notes"
            outlined
            dense
            type="textarea"
            rows="2"
            label="หมายเหตุ / จุดที่อยากฝึกโฟกัส"
            placeholder="เช่น เน้นเส้นเงาหลักและสัดส่วนช่วงไหล่"
          />
        </q-form>
      </q-card-section>

      <q-separator />

      <q-card-actions align="right" class="q-pa-md">
        <q-btn flat label="ยกเลิก" color="grey-7" no-caps v-close-popup />
        <q-btn
          unelevated
          color="primary"
          :icon="isEditMode ? 'save' : 'add'"
          :label="isEditMode ? 'บันทึกการแก้ไข' : 'บันทึก Preset'"
          no-caps
          :loading="submitting"
          @click="onSubmit"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, watch, computed, nextTick } from 'vue'
import { useQuasar } from 'quasar'
import { CATEGORY_OPTIONS, TIMER_OPTIONS } from '@/data/builtInReferences'
import {
  compressImageFile,
  parsePresetImages,
  serializePresetImages,
} from '@/utils/imageCompressor'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  editingPreset: {
    type: Object,
    default: null,
  },
  submitting: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'save'])

const $q = useQuasar()
const formRef = ref(null)
const imageMode = ref('upload')
const selectedFiles = ref(null)
const urlInput = ref('')

const form = ref({
  title: '',
  category: 'custom',
  duration: 60,
  images: [],
  notes: '',
})

const isEditMode = computed(() => Boolean(props.editingPreset?.id))

const categorySelectOptions = CATEGORY_OPTIONS.map((c) => ({
  label: c.label,
  value: c.value,
}))

const timerSelectOptions = TIMER_OPTIONS.map((t) => ({
  label: `${t.label} (${t.desc})`,
  value: t.value,
}))

const resetForm = async () => {
  selectedFiles.value = null
  urlInput.value = ''
  if (props.editingPreset) {
    form.value = {
      title: props.editingPreset.title || '',
      category: props.editingPreset.category || 'custom',
      duration: Number(props.editingPreset.duration) || 60,
      images: parsePresetImages(props.editingPreset),
      notes: props.editingPreset.notes || '',
    }
    imageMode.value = 'upload'
  } else {
    form.value = {
      title: '',
      category: 'custom',
      duration: 60,
      images: [],
      notes: '',
    }
    imageMode.value = 'upload'
  }
  await nextTick()
  formRef.value?.resetValidation()
}

watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      resetForm()
    }
  }
)

const handleFilesSelected = async (files) => {
  if (!files || files.length === 0) return
  const fileArray = Array.isArray(files) ? files : [files]
  try {
    for (const file of fileArray) {
      const compressedDataUrl = await compressImageFile(file, 480, 0.65)
      form.value.images.push(compressedDataUrl)
    }
    selectedFiles.value = null
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.message || 'ไม่สามารถประมวลผลรูปภาพได้',
    })
  }
}

const addImageUrl = () => {
  const trimmed = (urlInput.value || '').trim()
  if (!trimmed) return
  form.value.images.push(trimmed)
  urlInput.value = ''
}

const removeImage = (index) => {
  form.value.images.splice(index, 1)
}

const onSubmit = async () => {
  const valid = await formRef.value.validate()
  if (!valid) return

  if (form.value.images.length === 0) {
    $q.notify({
      type: 'warning',
      message: 'กรุณาเพิ่มรูปภาพอย่างน้อย 1 รูปก่อนบันทึก',
    })
    return
  }

  emit('save', {
    id: props.editingPreset?.id || null,
    payload: {
      title: form.value.title.trim(),
      category: form.value.category,
      duration: Number(form.value.duration),
      imageUrl: serializePresetImages(form.value.images),
      notes: form.value.notes.trim(),
    },
  })
}
</script>
