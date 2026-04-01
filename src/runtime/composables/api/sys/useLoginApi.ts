import type { Ref } from 'vue'
import type { ChangeUserPwdCmd, LoginResult, RequestResult, UsernamePasswordLoginPayload } from '#v/types'
import { createSharedComposable } from '@vueuse/core'
import { usePostFetch } from '../useApi'

type LoginApi = {
  loginByUsernameAndPassword: (cmd: UsernamePasswordLoginPayload) => Promise<{ data: Ref<RequestResult<LoginResult>> }>
  changeUserPassword: (cmd: ChangeUserPwdCmd) => Promise<{ data: Ref<RequestResult<unknown>> }>
}

export const useLoginApi = createSharedComposable((): LoginApi => {
  const basePath = '/login'
  return {
    loginByUsernameAndPassword: (cmd: UsernamePasswordLoginPayload) => {
      return usePostFetch<LoginResult>(`${basePath}/username-pwd`, cmd)
    },
    changeUserPassword: (cmd: ChangeUserPwdCmd) => {
      return usePostFetch(`${basePath}/pwd-change`, cmd)
    }
  }
})
