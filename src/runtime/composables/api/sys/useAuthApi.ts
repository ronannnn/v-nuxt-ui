import type { Ref } from 'vue'
import type { RequestResult } from '#v/types'
import { useGetFetch, usePostFetch } from '#v/composables'
import { createSharedComposable } from '@vueuse/core'

type AuthApi = {
  refreshToken: (cmd: Cmd.RefreshTokensPayload) => Promise<{ data: Ref<RequestResult<Cmd.LoginResult>> }>
  getUserByAccessToken: () => Promise<{ data: Ref<RequestResult<Model.User>> }>
}

export const useAuthApi = createSharedComposable((): AuthApi => {
  const basePath = '/auth'
  return {
    refreshToken: (cmd: Cmd.RefreshTokensPayload) => {
      return usePostFetch<Cmd.LoginResult>(`${basePath}/refresh`, cmd)
    },
    getUserByAccessToken: () => {
      return useGetFetch<Model.User>(`${basePath}/user`)
    }
  }
})
