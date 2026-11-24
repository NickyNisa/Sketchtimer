<template>
  <q-dialog :model-value="modelValue" persistent @update:model-value="$emit('update:modelValue', $event)">
    <q-card style="width: 100%; max-width: 540px; border-radius: 16px">
      <q-card-section class="row items-center justify-between bg-primary text-white">
        <div class="text-h6 heading-font">
          <q-icon :name="isEditMode ? 'edit' : 'add_photo_alternate'" class="q-mr-sm" />
          {{ isEditMode ? 'แก้ไข Preset ภาพวาด' : 'เพิ่ม Preset ภาพวาดใหม่' }}
        </div>
        <q-btn flat round dense icon="close" v-close-popup />
      </q-card-section>

      <q-card-section class="q-pt-md">
        <q-form ref="formRef" class="q-gutter-md">
          <q-input
            v-model="form.title"
            outlined
            dense
            label="ชื่อ Preset / ชื่อแบบวาด *"
            placeholder="เช่น ท่ากระโดดแอคชั่น, แจกันทรงกระบอก"
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
                { label: 'อัปโหลดรูปจากเครื่อง', value: 'upload', icon: 'upload_file' },
                { label: 'วางลิงก์รูป (URL)', value: 'url', icon: 'link' },
              ]"
            />

            <div v-if="imageMode === 'upload'">
              <q-file
                v-model="selectedFile"
                outlined
                dense
                accept="image/*"
                label="เลือกไฟล์รูปภาพ (.jpg, .png, .webp)"
                hint="ระบบจะย่อขนาดภาพอัตโนมัติเพื่อให้บันทึกลง MockAPI ได้รวดเร็ว"
                @update:model-value="handleFileSelected"
              >
                <template #prepend>
                  <q-icon name="image" color="primary" />
                </template>
              </q-file>
            </div>

            <div v-else>
              <q-input
                v-model="form.imageUrl"
                outlined
                dense
                label="URL รูปภาพ *"
                placeholder="https://example.com/reference.jpg"
                :rules="[(val) => Boolean(val && val.trim()) || 'กรุณาระบุรูปภาพ']"
              >
                <template #prepend>
                  <q-icon name="link" color="primary" />
                </template>
              </q-input>
            </div>
          </div>

          <div v-if="form.imageUrl" class="bg-grey-2 rounded-borders q-pa-sm text-center">
            <div class="text-caption text-grey-7 q-mb-xs">ตัวอย่างรูปภาพ</div>
            <q-img
              :src="form.imageUrl"
              fit="contain"
              style="max-height: 180px; border-radius: 8px"
            />
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
import { compressImageFile } from '@/utils/imageCompressor'

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
const selectedFile = ref(null)

const form = ref({
  title: '',
  category: 'custom',
  duration: 60,
  imageUrl: '',
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
  selectedFile.value = null
  if (props.editingPreset) {
    form.value = {
      title: props.editingPreset.title || '',
      category: props.editingPreset.category || 'custom',
      duration: Number(props.editingPreset.duration) || 60,
      imageUrl: props.editingPreset.imageUrl || '',
      notes: props.editingPreset.notes || '',
    }
    imageMode.value = props.editingPreset.imageUrl?.startsWith('data:') ? 'upload' : 'url'
  } else {
    form.value = {
      title: '',
      category: 'custom',
      duration: 60,
      imageUrl: '',
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

const handleFileSelected = async (file) => {
  if (!file) return
  try {
    const compressedDataUrl = await compressImageFile(file, 640, 0.72)
    form.value.imageUrl = compressedDataUrl
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.message || 'ไม่สามารถประมวลผลรูปภาพได้',
    })
  }
}

const onSubmit = async () => {
  const valid = await formRef.value.validate()
  if (!valid) return

  if (!form.value.imageUrl) {
    $q.notify({
      type: 'warning',
      message: 'กรุณาอัปโหลดรูปภาพหรือระบุ URL รูปภาพก่อนบันทึก',
    })
    return
  }

  emit('save', {
    id: props.editingPreset?.id || null,
    payload: {
      title: form.value.title.trim(),
      category: form.value.category,
      duration: Number(form.value.duration),
      imageUrl: form.value.imageUrl,
      notes: form.value.notes.trim(),
    },
  })
}
</script>
