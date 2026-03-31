import { LoginType } from '#v/constants'
import { StorageKey } from '#v/types'
import { createSharedComposable, useLocalStorage } from '@vueuse/core'
import { navigateTo } from 'nuxt/app'
import type { RouteLocationNormalizedLoadedGeneric } from 'vue-router'

export function _useRouterPush() {
  const toHome = async () => await navigateTo('/')

  const toSecuritySettings = async () => await navigateTo('/settings/security')

  const toLogin = async (route: RouteLocationNormalizedLoadedGeneric, redirectUrl?: string) => {
    useLocalStorage(StorageKey.ACCESS_TOKEN, '').value = undefined
    useLocalStorage(StorageKey.REFRESH_TOKEN, '').value = undefined
    let toLoginPage = ''
    const localLoginType = useLocalStorage(StorageKey.LOGIN_TYPE, LoginType.USERNAME_PASSWORD)
    switch (localLoginType.value) {
      case LoginType.USERNAME_PASSWORD:
        toLoginPage = '/login/pwd'
        break
      default:
        toLoginPage = '/login/pwd'
    }
    const redirect = redirectUrl || route.fullPath
    await navigateTo({ path: toLoginPage, query: { redirect } })
  }

  const redirectFromLogin = async (route: RouteLocationNormalizedLoadedGeneric) => {
    const redirect = route.query?.redirect as string

    if (redirect)
      await navigateTo(redirect)
    else
      toHome()
  }

  return {
    toLogin,
    toHome,
    toSecuritySettings,
    redirectFromLogin
  }
}

export const useRouterPush = createSharedComposable(_useRouterPush)
