import { StorageKey } from '#v/types'
import { isEmptyString } from '#v/utils'
import { useLocalStorage, createSharedComposable } from '@vueuse/core'
import type { UseFetchOptions } from 'nuxt/app'
import { useAuthApi, useLoading, useLoginApi, useRouterPush } from '.'
import type { RouteLocationNormalizedLoadedGeneric } from 'vue-router'
import { useToast } from '@nuxt/ui/runtime/composables/useToast.js'

const _useAuth = () => {
  const { loading: loginLoading, startLoading: startLoginLoading, endLoading: endLoginLoading } = useLoading()
  const { toLogin, redirectFromLogin, toSecuritySettings } = useRouterPush()

  const acT = useLocalStorage(StorageKey.ACCESS_TOKEN, '')
  const rfT = useLocalStorage(StorageKey.REFRESH_TOKEN, '')
  const loginUser = ref<Model.User>()
  const loginUserRoles = ref<Model.Role[]>([])
  const loginUserMenus = ref<Model.Menu[]>([])

  // 判断是否登录状态
  const isLoggedIn = computed(() => !isEmptyString(acT.value) || !isEmptyString(rfT.value))
  const isUserInfoFetched = computed(() => loginUser.value && loginUser.value.id > 0)

  /**
   * logout
   *
   * 1. 删除所有auth相关的cookie
   * 2. 跳转至登录页
   */
  const logout = async (route: RouteLocationNormalizedLoadedGeneric) => {
    // 删除所有auth相关的localStorage
    acT.value = undefined
    rfT.value = undefined
    loginUser.value = { id: 0 }
    // 跳转至登录页
    await toLogin(route)
  }

  const setUserInfo = (user: Model.User | undefined) => {
    loginUser.value = user
    loginUserRoles.value = user?.roles ?? []
    loginUserMenus.value = user?.menus ?? []
  }

  const loginByUsernameAndPassword = async (route: RouteLocationNormalizedLoadedGeneric, payload: Cmd.UsernamePasswordLoginPayload, redirect = true) => {
    startLoginLoading()
    try {
      const { data } = await useLoginApi().loginByUsernameAndPassword(payload)
      if (data.value?.data) {
        acT.value = data.value.data.accessToken
        rfT.value = data.value.data.refreshToken
        setUserInfo(data.value.data.user)

        // redirect
        if (loginUser.value?.needChangePwd) {
          await toSecuritySettings()
        } else if (redirect) {
          await redirectFromLogin(route)
        }
      }
    } finally {
      endLoginLoading()
    }
  }

  const initUserInfo = async (): Promise<boolean> => {
    startLoginLoading()
    try {
      const { data } = await useAuthApi().getUserByAccessToken()
      if (data.value?.data) {
        setUserInfo(data.value.data)
        return true
      }
      return false
    } finally {
      endLoginLoading()
    }
  }

  const refreshToken = async <T>(route: RouteLocationNormalizedLoadedGeneric, options: UseFetchOptions<T>): Promise<UseFetchOptions<T> | null> => {
    const { data } = await useAuthApi().refreshToken({ refreshToken: rfT.value })
    if (!data.value?.data) {
      useToast().add({
        title: '登录状态已过期，请重新登录',
        color: 'warning'
      })
      await logout(route)
      return null
    }
    acT.value = data.value.data.accessToken
    rfT.value = data.value.data.refreshToken
    const config = { ...options }
    if (config.headers) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${acT.value}`
      }
    }
    return config
  }

  return {
    loginLoading,
    isLoggedIn,
    isUserInfoFetched,
    loginUser,
    loginUserRoles,
    loginUserMenus,
    logout,
    loginByUsernameAndPassword,
    initUserInfo,
    refreshToken
  }
}

export const useAuth = createSharedComposable(_useAuth)
