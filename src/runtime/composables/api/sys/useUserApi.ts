import { cloneJson } from '#v/utils'
import { createSharedComposable } from '@vueuse/core'
import type { UseFetchOptions } from 'nuxt/app'
import { useApi, usePutFetch } from '../useApi'
import { useBizModel } from '../useModel'
import type { ApiGroup, ChangePwdPayload, RequestResult, User } from '#v/types'
import type { Ref } from 'vue'

type UserApiGroup = ApiGroup<User> & {
  changePwd: (payload: ChangePwdPayload, customOptions?: UseFetchOptions<unknown>) => Promise<{ data: Ref<RequestResult<unknown>> }>
  resetPwd: (userId: number, customOptions?: UseFetchOptions<unknown>) => Promise<{ data: Ref<RequestResult<unknown>> }>
}

export const useUserApi = createSharedComposable((): UserApiGroup => ({
  ...useApi<User>('/users'),
  prune: (model: User): User => {
    const cloned = cloneJson(model)
    delete cloned.jobTitle
    delete cloned.jobGrade
    delete cloned.department
    delete cloned.supervisor

    const bizModel = useBizModel()
    cloned.roles = bizModel.extractIds(cloned.roles)
    cloned.menus = bizModel.extractIds(cloned.menus)
    cloned.tablePermissions = bizModel.extractIds(cloned.tablePermissions)
    return cloned
  },
  copy: (model: User): User => ({
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

    loginType: model.loginType,
    tablePermissions: model.tablePermissions
  }),
  changePwd: (payload: ChangePwdPayload, customOptions: UseFetchOptions<unknown> = {}) => {
    return usePutFetch(`/users/pwd/change`, payload, customOptions)
  },
  resetPwd: (userId: number, customOptions: UseFetchOptions<unknown> = {}) => {
    return usePutFetch(`/users/pwd/reset/${userId}`, null, customOptions)
  }
}))
