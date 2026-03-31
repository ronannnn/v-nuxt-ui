import { cloneJson } from '#v/utils'
import { createSharedComposable } from '@vueuse/core'
import { useApi } from '../useApi'

export const useDepartmentApi = createSharedComposable(() => ({
  ...useApi<Model.Department>('/departments'),
  prune: (model: Model.Department) => {
    const cloned = cloneJson(model)
    delete cloned.company
    delete cloned.leader
    delete cloned.parent
    return cloned
  },
  copy: (model: Model.Department) => ({
    id: 0,
    companyId: model.companyId,
    company: model.company,
    leaderId: model.leaderId,
    leader: model.leader,
    parentId: model.parentId,
    parent: model.parent
  }),
  // 复制的时候，将此作为父部门
  copyAsParent: (model: Model.Department) => ({
    id: 0,
    companyId: model.companyId,
    company: model.company,
    parentId: model.id,
    parent: model
  })
}))
