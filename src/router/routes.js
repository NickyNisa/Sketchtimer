const routes = [
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        name: 'home',
        component: () => import('@/pages/HomePage.vue'),
        meta: { title: 'หน้าหลัก - SketchTimer' },
      },
      {
        path: 'practice',
        name: 'practice',
        component: () => import('@/pages/PracticePage.vue'),
        meta: { title: 'โหมดฝึกวาด (Present) - SketchTimer' },
      },
      {
        path: 'presets',
        name: 'presets',
        component: () => import('@/pages/MyPresetsPage.vue'),
        meta: {
          requiresAuth: true,
          title: 'Preset ของฉัน - SketchTimer',
        },
      },
      {
        path: 'login',
        name: 'login',
        component: () => import('@/pages/LoginPage.vue'),
        meta: { title: 'เข้าสู่ระบบ - SketchTimer' },
      },
    ],
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('@/pages/ErrorNotFound.vue'),
  },
]

export default routes
