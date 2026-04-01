import { cloneJson } from '#v/utils'
import { createSharedComposable } from '@vueuse/core'
import { useApi } from '../useApi'
import { MenuType } from '#v/constants'
import type { ApiGroup, Menu } from '#v/types'

export const useMenuApi = createSharedComposable((): ApiGroup<Menu> => ({
  ...useApi<Menu>('/menus'),
  prune: (model: Menu): Menu => {
    const cloned = cloneJson(model)
    delete cloned.parent
    return cloned
  },
  copy: (model: Menu): Menu => ({
    id: 0,
    type: model.type,
    parentId: model.parentId,
    parent: model.parent,
    i18nKey: model.i18nKey,
    staticRouteKeys: model.staticRouteKeys,
    permission: model.permission,
    order: String(Number(model.order) + 1),
    disabled: model.disabled
  }),
  // 复制的时候，将此作为父菜单
  copyAsParent: (model: Menu): Menu => ({
    id: 0,
    parentId: model.id,
    parent: model,
    type: MenuType.MENU,
    order: '1',
    staticRouteKeys: model.staticRouteKeys
  })
}))
