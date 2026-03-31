import colors from 'tailwindcss/colors'
import { defineNuxtPlugin, useAppConfig, useHead } from 'nuxt/app'
import { useColorMode } from '@vueuse/core'
import { computed } from 'vue'

export default defineNuxtPlugin({
  enforce: 'post',
  setup() {
    const appConfig = useAppConfig() as any
    const colorMode = useColorMode()

    const themeColor = computed(() =>
      colorMode.value === 'dark'
        ? (colors as unknown as Record<string, Record<string, string>>)[appConfig.ui?.colors?.neutral]?.[900]
        : 'white'
    )

    const radiusStyle = computed(() =>
      `:root { --ui-radius: ${appConfig.theme?.radius ?? 0.25}rem; }`
    )

    const blackAsPrimaryStyle = computed(() =>
      appConfig.theme?.blackAsPrimary
        ? `:root { --ui-primary: black; } .dark { --ui-primary: white; }`
        : ':root {}'
    )

    useHead({
      meta: [
        { key: 'theme-color', name: 'theme-color', content: themeColor }
      ],
      style: [
        { innerHTML: radiusStyle, id: 'nuxt-ui-radius', tagPriority: -2 },
        { innerHTML: blackAsPrimaryStyle, id: 'nuxt-ui-black-as-primary', tagPriority: -2 }
      ]
    })
  }
})
