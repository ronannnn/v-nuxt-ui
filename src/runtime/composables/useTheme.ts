import { computed } from 'vue'
import { createSharedComposable, useColorMode } from '@vueuse/core'
import type { I18nLocale } from '#v/types'
import { en, zh_cn } from '@nuxt/ui/locale'
import { useApp } from './useApp'
import { useAppConfig } from 'nuxt/app'
import type { SidebarProps } from '@nuxt/ui'

// All tailwindcss v4 primary color names (excluding neutrals & special values)
const twPrimaryColorNames = [
  'red', 'orange', 'amber', 'yellow', 'lime', 'green', 'emerald',
  'teal', 'cyan', 'sky', 'blue', 'indigo', 'violet', 'purple',
  'fuchsia', 'pink', 'rose'
]
const twNeutralColorNames = ['slate', 'gray', 'zinc', 'neutral', 'stone', 'taupe', 'mauve', 'mist', 'olive']

const _useTheme = () => {
  const appConfig = useAppConfig()
  const colorMode = useColorMode()
  const app = useApp()

  const neutral = computed({
    get() {
      return (appConfig as any).ui?.colors?.neutral
    },
    set(option) {
      console.log(option, appConfig);
      (appConfig as any).ui.colors.neutral = option
      app.updateNeutralColor(option)
    }
  })

  const blackAsPrimary = computed({
    get() {
      return (appConfig as any).theme?.blackAsPrimary
    },
    set(option) {
      (appConfig as any).theme.blackAsPrimary = option
      app.updateBlackAsPrimary(option)
    }
  })

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
  const primaryColorVars = computed(() => twPrimaryColorNames.map(c => `var(--color-${c}-${colorMode.value === 'light' ? '400' : '500'})`))

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

  const modes = computed<{
    label: string
    value: 'light' | 'dark' | 'auto'
    icon?: string
  }[]>(() => [
    { label: '明亮模式', value: 'light', icon: (appConfig as any).ui.icons.light },
    { label: '暗黑模式', value: 'dark', icon: (appConfig as any).ui.icons.dark },
    { label: '跟随系统', value: 'auto', icon: (appConfig as any).ui.icons.system }
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

  const sidebarSide = computed({
    get() {
      return app.appConfig.value.side ?? 'left'
    },
    set(value: SidebarProps['side']) {
      app.updateSidebarSide(value)
    }
  })

  const sidebarVariant = computed<SidebarProps['variant']>({
    get() {
      return app.appConfig.value.variant ?? 'separated'
    },
    set(value: SidebarProps['variant']) {
      app.updateSidebarVariant(value)
    }
  })
  const sidebarVariantOptions = computed<{
    label: string
    value: SidebarProps['variant']
  }[]>(() => [
    { label: '嵌入式', value: 'inset' },
    { label: '悬浮式', value: 'floating' },
    { label: '分离式', value: 'separated' }
  ])

  const sidebarCollapsible = computed({
    get() {
      return app.appConfig.value.collapsible ?? 'icon'
    },
    set(value: SidebarProps['collapsible']) {
      app.updateSidebarCollapsible(value)
    }
  })

  return {
    blackAsPrimary,
    neutralColors: twNeutralColorNames,
    neutral,
    primaryColors: twPrimaryColorNames,
    primary,
    chartColorVars,
    primaryColorVars,
    radiuses,
    radius,
    modes,
    mode,
    locale,
    locales,
    sidebarSide,
    sidebarVariant,
    sidebarVariantOptions,
    sidebarCollapsible
  }
}

export const useTheme = createSharedComposable(_useTheme)
