import { cloneJson } from '#v/utils'
import { createSharedComposable } from '@vueuse/core'
import type { UseFetchOptions } from 'nuxt/app'
import { useApi, usePutFetch } from '../useApi'
import { useBizModel } from '../useModel'

export const useUserApi = createSharedComposable(() => ({
  ...useApi<Model.User>('/users'),
  prune: (model: Model.User) => {
    const cloned = cloneJson(model)
    delete cloned.jobTitle
    delete cloned.jobGrade
    delete cloned.department
    delete cloned.supervisor

    const bizModel = useBizModel()
    cloned.roles = bizModel.extractIds(cloned.roles)
    cloned.menus = bizModel.extractIds(cloned.menus)
    return cloned
  },
  copy: (model: Model.User) => ({
    id: 0,

    jobTitleId: model.jobTitleId,
    jobTitle: model.jobTitle,
    jobGradeId: model.jobGradeId,
    jobGrade: model.jobGrade,
    departmentId: model.departmentId,
    department: model.department,
    supervisorId: model.supervisorId,
    supervisor: model.supervisor,
    entryDate: model.entryDate,
    resignDate: model.resignDate,
    gender: model.gender,

    loginType: model.loginType
  } satisfies Model.User) as any,
  changePwd: (payload: Cmd.User.ChangePwdPayload, customOptions: UseFetchOptions<unknown> = {}) => {
    return usePutFetch(`/users/pwd/change`, payload, customOptions)
  },
  resetPwd: (userId: number, customOptions: UseFetchOptions<unknown> = {}) => {
    return usePutFetch(`/users/pwd/reset/${userId}`, null, customOptions)
  }
}))
