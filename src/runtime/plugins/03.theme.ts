import { defaultAppSettings } from '#v/composables'
import { StorageKey } from '#v/types'
import { useLocalStorage } from '@vueuse/core'
import { defineNuxtPlugin, useAppConfig } from 'nuxt/app'

export default defineNuxtPlugin({
  enforce: 'post',
  setup() {
    const appConfig = useAppConfig()
    const customAppConfig = useLocalStorage(StorageKey.APP, defaultAppSettings)
    function updateColor(type: 'primary' | 'neutral') {
      const color = customAppConfig.value[type]
      if (color) {
        (appConfig as any).ui.colors[type] = color
      }
    }

    function updateBlackAsPrimary() {
      const blackAsPrimary = customAppConfig.value.blackAsPrimary
      if (blackAsPrimary) {
        (appConfig as any).theme.blackAsPrimary = blackAsPrimary === true
      }
    }

    function updateRadius() {
      const radius = customAppConfig.value.radius
      if (radius !== undefined) {
        (appConfig as any).theme.radius = radius
      }
    }

    updateColor('primary')
    updateColor('neutral')
    updateBlackAsPrimary()
    updateRadius()
  }
})
