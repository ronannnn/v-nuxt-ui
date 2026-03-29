export default defineNuxtConfig({
  modules: [
    '../src/module',
    '@nuxt/ui',
    '@nuxt/content',
    '@nuxtjs/i18n',
    '@vueuse/nuxt'
  ],

  ssr: false,

  imports: {
    dirs: ['composables/**', 'constants/**']
  },

  css: [
    '~/assets/css/main.css'
  ],

  devtools: { enabled: true },

  content: {
    build: {
      markdown: {
        highlight: {
          langs: ['bash', 'ts', 'typescript', 'diff', 'vue', 'json', 'css', 'mdc']
        }
      }
    }
  },

  mdc: {
    highlight: {
      noApiRoute: false
    }
  },

  routeRules: {
    '/docs': { redirect: '/docs/getting-started', prerender: false }
  },

  i18n: {
    locales: [
      { code: 'en', name: 'English' },
      { code: 'zh-CN', name: '中文' }
    ],
    defaultLocale: 'zh-CN'
  },

  vNuxtUI: {
    prefix: 'Pro'
  },

  compatibilityDate: '2025-01-01'
})
