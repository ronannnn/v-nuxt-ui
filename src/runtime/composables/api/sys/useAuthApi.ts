import type { Ref } from 'vue'
import type { LoginResult, RefreshTokensPayload, RequestResult, User } from '#v/types'
import { useGetFetch, usePostFetch } from '#v/composables'
import { createSharedComposable } from '@vueuse/core'

type AuthApi = {
  refreshToken: (cmd: RefreshTokensPayload) => Promise<{ data: Ref<RequestResult<LoginResult>> }>
  getUserByAccessToken: () => Promise<{ data: Ref<RequestResult<User>> }>
}

export const useAuthApi = createSharedComposable((): AuthApi => {
  const basePath = '/auth'
  return {
    refreshToken: (cmd: RefreshTokensPayload) => {
      return usePostFetch<LoginResult>(`${basePath}/refresh`, cmd)
    },
    getUserByAccessToken: () => {
      return useGetFetch<User>(`${basePath}/user`)
    }
  }
})
