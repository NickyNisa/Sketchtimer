import { defineConfig } from '#q-app/wrappers'
import { fileURLToPath } from 'node:url'

export default defineConfig((/* ctx */) => {
  return {
    boot: [
      'pinia',
      'axios',
    ],

    css: [
      'app.scss',
    ],

    extras: [
      'roboto-font',
      'material-icons',
    ],

    build: {
      target: {
        browser: ['es2022', 'firefox115', 'chrome115', 'safari14'],
        node: 'node20',
      },
      vueRouterMode: 'history',
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
      extendViteConf(viteConf) {
        viteConf.envPrefix = ['QCLI_', 'VITE_']
      },
    },

    devServer: {
      open: true,
    },

    framework: {
      config: {
        notify: {
          position: 'top-right',
          timeout: 2500,
        },
      },
      plugins: [
        'Notify',
        'Dialog',
        'Loading',
      ],
    },

    animations: [],
  }
})
