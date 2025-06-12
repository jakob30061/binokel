import svgLoader from "vite-svg-loader"
import Aura from '@primevue/themes/aura';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  ssr: true,
  future: {
    compatibilityVersion: 4,
  },
  experimental: {
    componentIslands: true,
  },
  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/color-mode',
    '@vueuse/nuxt',
    '@primevue/nuxt-module',
    '@nuxtjs/i18n',
    '@pinia/nuxt',
    '@nuxt/test-utils/module'
  ],
  i18n: {
    locales: ['en', 'de'],
    vueI18n: '@/i18n/config.ts',
    defaultLocale: 'de',
    strategy: 'prefix'
  },
  primevue: {
    options: {
      theme: {
        preset: Aura
      }
    }
  },
  vite: {
    plugins: [
      svgLoader(),
    ]
  },
  nitro: {
    experimental: {
      websocket: true,
      tasks: true
    },
    scheduledTasks: {
      '* 0 * * *': ['check:integrity']
    }
  },
  colorMode: {
    preference: 'dark',
    fallback: 'dark',
    classSuffix: ''
  }
})