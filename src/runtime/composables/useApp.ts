import { ref, computed } from 'vue'
import { breakpointsTailwind, createSharedComposable, useBreakpoints, useLocalStorage } from '@vueuse/core'
import { StorageKey, type CustomAppConfig, type I18nLocale } from '../types'
import { cloneJson } from '#v/utils/string'

export const defaultAppSettings: CustomAppConfig = {
  headerHeight: 48,
  tabHeight: 40,
  siderMaxWidth: 20,
  siderMinWidth: 10,
  siderCollapsed: false,
  siderCollapsedWidth: 5,
  locale: 'zh-CN',
  pageAnimate: true,
  pageAnimateMode: 'fade-slide'
}

const _useApp = () => {
  const themeSettingsVisible = ref(false)
  const changelogVisible = ref(false)

  const appConfig = useLocalStorage<CustomAppConfig>(StorageKey.APP, defaultAppSettings)
  const resetAppConfig = () => appConfig.value = cloneJson(defaultAppSettings)

  const updatePrimaryColor = (color: string) => {
    appConfig.value = { ...appConfig.value, primary: color, blackAsPrimary: false }
  }
  const updateBlackAsPrimary = (value: boolean) => {
    appConfig.value = { ...appConfig.value, blackAsPrimary: value }
  }
  const updateNeutralColor = (color: string) => {
    appConfig.value = { ...appConfig.value, neutral: color }
  }
  const updateRadius = (radius: number) => {
    appConfig.value = { ...appConfig.value, radius }
  }
  const updateLocale = (locale: I18nLocale) => {
    appConfig.value = { ...appConfig.value, locale }
  }

  const keepalive = computed<boolean>({
    get() {
      return appConfig.value.keepalive ?? true
    },
    set(value: boolean) {
      appConfig.value = { ...appConfig.value, keepalive: value }
    }
  })
  const setKeepalive = (value: boolean) => keepalive.value = value

  const breakpoints = useBreakpoints(breakpointsTailwind)
  const isMobile = breakpoints.smaller('sm')
  const isSmallerThanMd = breakpoints.smaller('md')

  const redirectConfirm = ref(false)
  const redirectConfirmTitle = ref('')
  const redirectConfirmMsg = ref('')
  const askRedirectConfirmBeforeLeave = (title: string, msg: string) => {
    redirectConfirm.value = true
    redirectConfirmTitle.value = title
    redirectConfirmMsg.value = msg
  }
  const clearRedirectConfirm = () => {
    redirectConfirm.value = false
    redirectConfirmTitle.value = ''
    redirectConfirmMsg.value = ''
  }

  return {
    themeSettingsVisible,
    changelogVisible,
    appConfig,
    resetAppConfig,
    updatePrimaryColor,
    updateBlackAsPrimary,
    updateNeutralColor,
    updateRadius,
    updateLocale,
    keepalive,
    setKeepalive,
    isMobile,
    isSmallerThanMd,
    redirectConfirm,
    redirectConfirmTitle,
    redirectConfirmMsg,
    askRedirectConfirmBeforeLeave,
    clearRedirectConfirm
  }
}

export const useApp = createSharedComposable(_useApp)
