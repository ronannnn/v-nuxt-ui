import type { Ref } from 'vue'
import type { RequestResult } from '#v/types'
import { createSharedComposable } from '@vueuse/core'
import { usePostFetch } from '../useApi'

type LoginApi = {
  loginByUsernameAndPassword: (cmd: Cmd.UsernamePasswordLoginPayload) => Promise<{ data: Ref<RequestResult<Cmd.LoginResult>> }>
  changeUserPassword: (cmd: Cmd.ChangeUserPwdCmd) => Promise<{ data: Ref<RequestResult<unknown>> }>
}

export const useLoginApi = createSharedComposable((): LoginApi => {
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
