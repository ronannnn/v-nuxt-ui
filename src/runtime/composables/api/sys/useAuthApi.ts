import { useGetFetch, usePostFetch } from '#v/composables'
import { createSharedComposable } from '@vueuse/core'

export const useAuthApi = createSharedComposable(() => {
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
