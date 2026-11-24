import { defineRouter } from '#q-app/wrappers'
import {
  createRouter,
  createMemoryHistory,
  createWebHistory,
  createWebHashHistory,
} from 'vue-router'
import { Notify } from 'quasar'
import routes from './routes'
import { useAuthStore } from '@/stores/auth-store'

export default defineRouter(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === 'history'
      ? createWebHistory
      : createWebHashHistory

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    history: createHistory(process.env.VUE_ROUTER_BASE),
  })

  // Global Navigation Guard
  Router.beforeEach((to, from, next) => {
    const authStore = useAuthStore()

    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
      Notify.create({
        type: 'warning',
        icon: 'lock',
        message: 'กรุณาเข้าสู่ระบบก่อนใช้งานหน้าจัดการ Preset ของฉัน',
      })
      return next({
        name: 'login',
        query: { redirect: to.fullPath },
      })
    }

    if (to.name === 'login' && authStore.isAuthenticated) {
      return next({ name: 'presets' })
    }

    next()
  })

  return Router
})
