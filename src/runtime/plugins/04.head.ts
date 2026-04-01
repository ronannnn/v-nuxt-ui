import { defineNuxtPlugin, useAppConfig, useHead } from 'nuxt/app'
import { computed } from 'vue'

export default defineNuxtPlugin({
  enforce: 'post',
  setup() {
    const appConfig = useAppConfig() as any

    const radiusStyle = computed(() =>
      `:root { --ui-radius: ${appConfig.theme?.radius ?? 0.25}rem; }`
    )

    const blackAsPrimaryStyle = computed(() =>
      appConfig.theme?.blackAsPrimary
        ? `:root { --ui-primary: black; } .dark { --ui-primary: white; }`
        : ':root {}'
    )

    useHead({
      style: [
        { innerHTML: radiusStyle, id: 'nuxt-ui-radius', tagPriority: -2 },
        { innerHTML: blackAsPrimaryStyle, id: 'nuxt-ui-black-as-primary', tagPriority: -2 }
      ]
    })
  }
})
