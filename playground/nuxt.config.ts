export default defineNuxtConfig({
  modules: [
    '../src/module',
    '@nuxt/ui',
    '@nuxtjs/i18n',
    '@vueuse/nuxt'
  ],

  devtools: { enabled: true },

  i18n: {
    locales: [
      { code: 'en', name: 'English' },
      { code: 'zh-CN', name: '中文' }
    ],
    defaultLocale: 'en'
  },

  vNuxtUI: {
    prefix: 'Pro'
  },

  compatibilityDate: '2025-01-01'
})
