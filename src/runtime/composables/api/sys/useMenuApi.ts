import { cloneJson } from '#v/utils'
import { createSharedComposable } from '@vueuse/core'
import { useApi } from '../useApi'
import { MenuType } from '#v/constants'

export const useMenuApi = createSharedComposable(() => ({
  ...useApi<Model.Menu>('/menus'),
  prune: (model: Model.Menu) => {
    const cloned = cloneJson(model)
    delete cloned.parent
    return cloned
  },
  copy: (model: Model.Menu) => ({
    id: 0,
    type: model.type,
    parentId: model.parentId,
    parent: model.parent,
    i18nKey: model.i18nKey,
    staticRouteKey: model.staticRouteKeys,
    permission: model.permission,
    order: String(Number(model.order) + 1),
    disabled: model.disabled
  }),
  // 复制的时候，将此作为父菜单
  copyAsParent: (model: Model.Menu) => ({
    id: 0,
    parentId: model.id,
    parent: model,
    type: MenuType.MENU,
    order: '1',
    staticRouteKey: model.staticRouteKeys
  })
}))
