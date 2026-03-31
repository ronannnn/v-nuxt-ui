import { computed } from 'vue'
import { createSharedComposable, useColorMode } from '@vueuse/core'
import colors from 'tailwindcss/colors'
import { omit } from '@nuxt/ui/utils'
import type { I18nLocale } from '#v/types'
import { en, zh_cn } from '@nuxt/ui/locale'
import { useApp } from './useApp'
import { useAppConfig } from 'nuxt/app'

const _useTheme = () => {
  const appConfig = useAppConfig()
  const colorMode = useColorMode()
  const app = useApp()

  const neutralColors = ['slate', 'gray', 'zinc', 'neutral', 'stone']
  const neutral = computed({
    get() {
      return (appConfig as any).ui.colors.neutral
    },
    set(option) {
      (appConfig as any).ui.colors.neutral = option
      app.updateNeutralColor(option)
    }
  })

  const blackAsPrimary = computed({
    get() {
      return (appConfig as any).theme.blackAsPrimary
    },
    set(option) {
      (appConfig as any).theme.blackAsPrimary = option
      app.updateBlackAsPrimary(option)
    }
  })

  const colorsToOmit = ['inherit', 'current', 'transparent', 'black', 'white', ...neutralColors]
  const primaryColors = Object.keys(omit(colors, colorsToOmit as any))
  const primary = computed({
    get() {
      return (appConfig as any).ui.colors.primary
    },
    set(option) {
      (appConfig as any).ui.colors.primary = option;
      (appConfig as any).theme.blackAsPrimary = false
      app.updatePrimaryColor(option)
    }
  })

  const chartColorVars = computed(() => ['chart-1', 'chart-2', 'chart-3', 'chart-4', 'chart-5'].map(c => `var(--${c})`))
  const primaryColorVars = computed(() => primaryColors.map(c => `var(--color-${c}-${colorMode.value === 'light' ? '400' : '500'})`))

  const radiuses = [0, 0.125, 0.25, 0.375, 0.5]
  const radius = computed({
    get() {
      return (appConfig as any).theme.radius
    },
    set(option) {
      (appConfig as any).theme.radius = option
      app.updateRadius(option)
    }
  })

  const modes = computed(() => [
    { label: '明亮模式', value: 'light', icon: (appConfig as any).ui.icons.light },
    { label: '暗黑模式', value: 'dark', icon: (appConfig as any).ui.icons.dark },
    { label: '跟随系统', value: 'system', icon: (appConfig as any).ui.icons.system }
  ])
  const mode = computed({
    get() {
      return colorMode.value
    },
    set(option) {
      colorMode.value = option
    }
  })

  const locales = [zh_cn, en]
  const locale = computed<I18nLocale>({
    get() {
      return app.appConfig.value.locale ?? 'zh-CN'
    },
    set(value: I18nLocale) {
      app.updateLocale(value)
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
