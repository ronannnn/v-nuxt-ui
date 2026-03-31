import { cloneJson } from '#v/utils'
import { createSharedComposable } from '@vueuse/core'
import { useApi } from '../useApi'
import { useBizModel } from '../useModel'

export const useRoleApi = createSharedComposable(() => ({
  ...useApi<Model.Role>('/roles'),
  prune: (model: Model.Role) => {
    const cloned = cloneJson(model)
    cloned.menus = useBizModel().extractIds(cloned.menus)
    return cloned
  },
  copy: (model: Model.Role) => ({
    id: 0,
    name: model.name,
    permission: model.permission,
    disabled: model.disabled,
    remark: model.remark,
    menus: model.menus
  })
}))
