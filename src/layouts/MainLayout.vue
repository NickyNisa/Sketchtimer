<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar class="q-px-sm q-px-md-md">
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          class="lt-md q-mr-xs"
          @click="leftDrawerOpen = !leftDrawerOpen"
        />

        <q-toolbar-title
          class="row items-center no-wrap cursor-pointer"
          style="min-width: 0"
          @click="router.push({ name: 'home' })"
        >
          <q-icon name="brush" size="22px" class="q-mr-xs shrink-0" />
          <span
            class="heading-font text-weight-bold ellipsis"
            :class="$q.screen.lt.sm ? 'text-subtitle1' : 'text-h6'"
          >
            {{ $q.screen.lt.sm ? shortTitle : appTitle }}
          </span>
        </q-toolbar-title>
        <div class="gt-sm row items-center q-gutter-xs q-mr-md">
          <q-btn
            flat
            no-caps
            icon="home"
            label="หน้าหลัก"
            :to="{ name: 'home' }"
          />
          <q-btn
            flat
            no-caps
            icon="slideshow"
            label="โหมดฝึกวาด (Present)"
            :to="{ name: 'practice' }"
          />
          <q-btn
            flat
            no-caps
            icon="collections_bookmark"
            label="Preset ของฉัน"
            :to="{ name: 'presets' }"
          />
        </div>

        <div v-if="authStore.isAuthenticated" class="row items-center no-wrap q-gutter-xs">
          <q-chip
            color="white"
            text-color="primary"
            icon="person"
            dense
            class="gt-xs text-weight-medium"
          >
            {{ authStore.displayName }}
          </q-chip>
          <q-btn
            unelevated
            dense
            size="sm"
            color="negative"
            icon="logout"
            :label="$q.screen.gt.xs ? 'ออกจากระบบ' : ''"
            :round="$q.screen.xs"
            no-caps
            class="q-px-xs q-px-sm-sm"
            @click="onLogout"
          >
            <q-tooltip>ออกจากระบบ</q-tooltip>
          </q-btn>
        </div>
        <div v-else>
          <q-btn
            unelevated
            dense
            size="sm"
            color="white"
            text-color="primary"
            icon="login"
            :label="$q.screen.gt.xs ? 'เข้าสู่ระบบ' : 'Login'"
            no-caps
            class="q-px-sm"
            :to="{ name: 'login' }"
          />
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" bordered class="bg-white">
      <q-list padding>
        <q-item-label header class="text-weight-bold text-primary">
          เมนูหลัก
        </q-item-label>

        <q-item clickable v-ripple :to="{ name: 'home' }" exact>
          <q-item-section avatar><q-icon name="home" color="primary" /></q-item-section>
          <q-item-section>หน้าหลัก</q-item-section>
        </q-item>

        <q-item clickable v-ripple :to="{ name: 'practice' }">
          <q-item-section avatar><q-icon name="slideshow" color="secondary" /></q-item-section>
          <q-item-section>โหมดฝึกวาด (Present)</q-item-section>
        </q-item>

        <q-item clickable v-ripple :to="{ name: 'presets' }">
          <q-item-section avatar><q-icon name="collections_bookmark" color="accent" /></q-item-section>
          <q-item-section>
            <q-item-label>Preset ของฉัน</q-item-label>
            <q-item-label caption>ต้องเข้าสู่ระบบ</q-item-label>
          </q-item-section>
        </q-item>

        <q-separator class="q-my-md" />

        <q-item v-if="!authStore.isAuthenticated" clickable v-ripple :to="{ name: 'login' }">
          <q-item-section avatar><q-icon name="login" color="primary" /></q-item-section>
          <q-item-section>เข้าสู่ระบบ / สมัครสมาชิก</q-item-section>
        </q-item>
        <q-item v-else clickable v-ripple @click="onLogout">
          <q-item-section avatar><q-icon name="logout" color="negative" /></q-item-section>
          <q-item-section>ออกจากระบบ ({{ authStore.displayName }})</q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuthStore } from '@/stores/auth-store'

const router = useRouter()
const $q = useQuasar()
const authStore = useAuthStore()

const leftDrawerOpen = ref(false)
const appTitle = import.meta.env.QCLI_APP_TITLE || 'SketchTimer'
const shortTitle = appTitle.split('-')[0].trim() || 'SketchTimer'

const onLogout = () => {
  $q.dialog({
    title: 'ยืนยันการออกจากระบบ',
    message: 'คุณต้องการออกจากระบบใช่หรือไม่?',
    cancel: { label: 'ยกเลิก', flat: true, color: 'grey-7' },
    ok: { label: 'ออกจากระบบ', color: 'negative', unelevated: true },
    persistent: true,
  }).onOk(() => {
    authStore.logout()
    $q.notify({
      type: 'positive',
      icon: 'check_circle',
      message: 'ออกจากระบบเรียบร้อยแล้ว',
    })
    router.replace({ name: 'home' })
  })
}
</script>
