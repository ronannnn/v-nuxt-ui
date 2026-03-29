import { computed } from 'vue'
import { useAppConfig, useColorMode, useI18n } from '#imports'
import { createSharedComposable } from '@vueuse/core'
import colors from 'tailwindcss/colors'
import { omit } from '@nuxt/ui/utils'
import type { I18nLocale } from '../types'
import { en, zh_cn } from '@nuxt/ui/locale'
import { useApp } from './useApp'

const _useTheme = () => {
  const appConfig = useAppConfig()
  const colorMode = useColorMode()
  const i18n = useI18n()
  const app = useApp()

  const neutralColors = ['slate', 'gray', 'zinc', 'neutral', 'stone']
  const neutral = computed({
    get() { return appConfig.ui.colors.neutral },
    set(option) {
      appConfig.ui.colors.neutral = option
      app.updateNeutralColor(option)
    }
  })

  const blackAsPrimary = computed({
    get() { return appConfig.theme.blackAsPrimary },
    set(option) {
      appConfig.theme.blackAsPrimary = option
      app.updateBlackAsPrimary(option)
    }
  })

  const colorsToOmit = ['inherit', 'current', 'transparent', 'black', 'white', ...neutralColors]
  const primaryColors = Object.keys(omit(colors, colorsToOmit as any))
  const primary = computed({
    get() { return appConfig.ui.colors.primary },
    set(option) {
      appConfig.ui.colors.primary = option
      appConfig.theme.blackAsPrimary = false
      app.updatePrimaryColor(option)
    }
  })

  const chartColorVars = computed(() => ['chart-1', 'chart-2', 'chart-3', 'chart-4', 'chart-5'].map(c => `var(--${c})`))
  const primaryColorVars = computed(() => primaryColors.map(c => `var(--color-${c}-${colorMode.value === 'light' ? '400' : '500'})`))

  const radiuses = [0, 0.125, 0.25, 0.375, 0.5]
  const radius = computed({
    get() { return appConfig.theme.radius },
    set(option) {
      appConfig.theme.radius = option
      app.updateRadius(option)
    }
  })

  const modes = computed(() => [
    { label: i18n.t('colorMode.light'), value: 'light', icon: appConfig.ui.icons.light },
    { label: i18n.t('colorMode.dark'), value: 'dark', icon: appConfig.ui.icons.dark },
    { label: i18n.t('colorMode.system'), value: 'system', icon: appConfig.ui.icons.system }
  ])
  const mode = computed({
    get() { return colorMode.preference },
    set(option) { colorMode.preference = option }
  })

  const locales = [zh_cn, en]
  const locale = computed<I18nLocale>({
    get() { return app.appConfig.value.locale ?? 'zh-CN' },
    set(value: I18nLocale) {
      app.updateLocale(value)
      i18n.setLocale(value)
    }
  })

  return {
    blackAsPrimary,
    neutralColors,
    neutral,
    primaryColors,
    primary,
    chartColorVars,
    primaryColorVars,
    radiuses,
    radius,
    modes,
    mode,
    locale,
    locales
  }
}

export const useTheme = createSharedComposable(_useTheme)
