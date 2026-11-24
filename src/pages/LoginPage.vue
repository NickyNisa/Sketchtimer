<template>
  <q-page class="flex flex-center bg-grey-2 q-pa-md">
    <q-card class="q-pa-lg shadow-4" style="width: 100%; max-width: 420px; border-radius: 16px">
      <q-card-section class="text-center q-pb-sm">
        <q-avatar size="64px" color="primary" text-color="white" icon="brush" class="q-mb-sm" />
        <div class="text-h5 text-weight-bold heading-font text-dark">
          SketchTimer Account
        </div>
        <div class="text-caption text-grey-6">
          เข้าสู่ระบบเพื่ออัปโหลด บันทึก และแก้ไข Preset ภาพวาดของคุณ
        </div>
      </q-card-section>

      <q-tabs
        v-model="activeTab"
        dense
        active-color="primary"
        indicator-color="primary"
        align="justify"
        class="text-grey-7 q-mb-md"
      >
        <q-tab name="login" label="เข้าสู่ระบบ" no-caps />
        <q-tab name="register" label="สมัครสมาชิก" no-caps />
      </q-tabs>

      <q-banner
        v-if="authStore.errorMessage"
        rounded
        dense
        class="bg-red-1 text-negative q-mb-md"
      >
        <template #avatar>
          <q-icon name="error" color="negative" />
        </template>
        {{ authStore.errorMessage }}
      </q-banner>

      <!-- Login Form -->
      <q-form v-if="activeTab === 'login'" @submit.prevent="onLogin" class="q-gutter-md">
        <q-input
          v-model="loginForm.username"
          outlined
          dense
          label="ชื่อผู้ใช้ (Username)"
          :rules="[(val) => !!val || 'กรุณากรอกชื่อผู้ใช้']"
        >
          <template #prepend><q-icon name="person" color="primary" /></template>
        </q-input>

        <q-input
          v-model="loginForm.password"
          outlined
          dense
          :type="showPassword ? 'text' : 'password'"
          label="รหัสผ่าน (Password)"
          :rules="[(val) => !!val || 'กรุณากรอกรหัสผ่าน']"
        >
          <template #prepend><q-icon name="lock" color="primary" /></template>
          <template #append>
            <q-icon
              :name="showPassword ? 'visibility_off' : 'visibility'"
              class="cursor-pointer"
              @click="showPassword = !showPassword"
            />
          </template>
        </q-input>

        <q-btn
          type="submit"
          unelevated
          color="primary"
          label="เข้าสู่ระบบ"
          size="md"
          no-caps
          class="full-width text-weight-bold"
          :loading="authStore.loading"
        />
      </q-form>

      <!-- Register Form -->
      <q-form v-else @submit.prevent="onRegister" class="q-gutter-md">
        <q-input
          v-model="registerForm.name"
          outlined
          dense
          label="ชื่อที่แสดง (Display Name)"
          :rules="[(val) => !!val || 'กรุณากรอกชื่อที่แสดง']"
        >
          <template #prepend><q-icon name="badge" color="secondary" /></template>
        </q-input>

        <q-input
          v-model="registerForm.username"
          outlined
          dense
          label="ชื่อผู้ใช้ (Username)"
          :rules="[(val) => !!val || 'กรุณากรอกชื่อผู้ใช้']"
        >
          <template #prepend><q-icon name="person" color="secondary" /></template>
        </q-input>

        <q-input
          v-model="registerForm.password"
          outlined
          dense
          :type="showPassword ? 'text' : 'password'"
          label="รหัสผ่าน (อย่างน้อย 4 ตัวอักษร)"
          :rules="[
            (val) => !!val || 'กรุณากรอกรหัสผ่าน',
            (val) => val.length >= 4 || 'รหัสผ่านต้องมีอย่างน้อย 4 ตัวอักษร',
          ]"
        >
          <template #prepend><q-icon name="lock" color="secondary" /></template>
          <template #append>
            <q-icon
              :name="showPassword ? 'visibility_off' : 'visibility'"
              class="cursor-pointer"
              @click="showPassword = !showPassword"
            />
          </template>
        </q-input>

        <q-btn
          type="submit"
          unelevated
          color="secondary"
          label="สมัครสมาชิกและเข้าสู่ระบบ"
          size="md"
          no-caps
          class="full-width text-weight-bold"
          :loading="authStore.loading"
        />
      </q-form>

      <div class="text-center q-mt-md">
        <q-btn flat dense no-caps color="grey-7" label="กลับหน้าหลัก (ฝึกวาดแบบพื้นฐาน)" :to="{ name: 'home' }" />
      </div>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuthStore } from '@/stores/auth-store'

const router = useRouter()
const route = useRoute()
const $q = useQuasar()
const authStore = useAuthStore()

const activeTab = ref('login')
const showPassword = ref(false)

const loginForm = ref({
  username: '',
  password: '',
})

const registerForm = ref({
  name: '',
  username: '',
  password: '',
})

const redirectAfterAuth = () => {
  const target = route.query.redirect || '/presets'
  router.replace(target)
}

const onLogin = async () => {
  try {
    await authStore.login(loginForm.value.username, loginForm.value.password)
    $q.notify({
      type: 'positive',
      icon: 'check_circle',
      message: `ยินดีต้อนรับกลับมา, ${authStore.displayName}!`,
    })
    redirectAfterAuth()
  } catch {
    // Error is already stored in authStore.errorMessage
  }
}

const onRegister = async () => {
  try {
    await authStore.register(registerForm.value)
    $q.notify({
      type: 'positive',
      icon: 'how_to_reg',
      message: `สมัครสมาชิกสำเร็จ! ยินดีต้อนรับ ${authStore.displayName}`,
    })
    redirectAfterAuth()
  } catch {
    // Error is already stored in authStore.errorMessage
  }
}
</script>
