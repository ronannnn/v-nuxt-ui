import { createSharedComposable } from '@vueuse/core'
import { usePostFetch } from '../useApi'

export const useLoginApi = createSharedComposable(() => {
  const basePath = '/login'
  return {
    loginByUsernameAndPassword: (cmd: Cmd.UsernamePasswordLoginPayload) => {
      return usePostFetch<Cmd.LoginResult>(`${basePath}/username-pwd`, cmd)
    },
    changeUserPassword: (cmd: Cmd.ChangeUserPwdCmd) => {
      return usePostFetch(`${basePath}/pwd-change`, cmd)
    }
  }
})
