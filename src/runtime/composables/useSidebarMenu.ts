import { flattenTree } from '#v/utils'
import { createSharedComposable } from '@vueuse/core'
import { useAuth } from './useAuth'
import type { ComputedRef, Ref } from 'vue'
import { ref, computed, watch } from 'vue'
import type { Menu, Role } from '#v/types'

// Lightweight local types to avoid deep external type instantiation
type ShallowNavigationMenuItem = {
  to?: string
  triggerTo?: string
  children?: ShallowNavigationMenuItem[]
  label?: string
  icon?: string
  disabled?: boolean
  open?: boolean
  defaultOpen?: boolean
  staticRouteKeys?: string[]
}

type ShallowBreadcrumbItem = {
  label?: string
  icon?: string
  to?: string
  children?: ShallowBreadcrumbItem[]
}

// Global defaults for sidebar menus. Library consumers can call
// `setGlobalSidebarMenus` once (e.g. in layout or plugin) to initialize
// these values, then call `useSidebarMenus()` without args everywhere.
const constantMenus = ref<ShallowNavigationMenuItem[]>([])
const bizMenus = ref<ShallowNavigationMenuItem[]>([])
const menuMode = ref<'static' | 'dynamic'>('static')

export function setGlobalSidebarMenus(opts: {
  constantMenus?: ShallowNavigationMenuItem[]
  bizMenus?: ShallowNavigationMenuItem[]
  menuMode?: 'static' | 'dynamic'
}) {
  if (opts.constantMenus) constantMenus.value = opts.constantMenus
  if (opts.bizMenus) bizMenus.value = opts.bizMenus
  if (opts.menuMode) menuMode.value = opts.menuMode
}

export const _useSidebarMenus = (): {
  constantMenus: Ref<ShallowNavigationMenuItem[]>
  constantMenuPathSet: ComputedRef<Set<string>>
  bizMenus: Ref<ShallowNavigationMenuItem[]>
  flattenBizMenus: ComputedRef<ShallowNavigationMenuItem[]>
  bizMenuPathSet: ComputedRef<Set<string>>
  menusFromUser: Ref<Menu[]>
  sidebarMenus: Ref<ShallowNavigationMenuItem[]>
  sidebarMenuPathSet: Ref<Set<string>>
  expandSidebarMenu: (path: string) => void
  setUserDynamicMenus: (newRolesFromUser: Role[], newMenusFromUser: Menu[]) => void
  disabledMenuPathSet: ComputedRef<Set<string>>
  breadcrumbs: Ref<ShallowBreadcrumbItem[]>
  getBreadcrumbs: (current: string, menus?: ShallowNavigationMenuItem[]) => ShallowBreadcrumbItem[]
} => {
  const { loginUserRoles, loginUserMenus } = useAuth()
  // constant menu
  // 这些菜单无需添加到数据库以及用户权限中
  const constantMenuPathSet = computed<Set<string>>(() => {
    const set = new Set<string>()
    flattenTree(constantMenus.value).forEach((menu) => {
      set.add(menu.to as string)
    })
    return set
  })

  // biz menus
  const flattenBizMenus = computed<ShallowNavigationMenuItem[]>(() => flattenTree(bizMenus.value) as ShallowNavigationMenuItem[])
  const bizMenuPathSet = computed<Set<string>>(() => {
    const set = new Set<string>()
    flattenBizMenus.value.forEach((menu) => {
      set.add(menu.to as string)
    })
    return set
  })

  // hide menus except from specific keys
  const hideNoPermissionMenus = (menuItems: ShallowNavigationMenuItem[], paths: Set<string>): ShallowNavigationMenuItem[] => {
    return menuItems
      .filter(menuItem => paths.has(menuItem.to as string) || paths.has(menuItem.triggerTo as string))
      .map((menuItem) => {
        if (menuItem.children) {
          // Create a shallow copy to avoid mutating the original object and prevent deep type recursion
          return {
            ...menuItem,
            children: hideNoPermissionMenus(menuItem.children as ShallowNavigationMenuItem[], paths)
          }
        }
        return { ...menuItem }
      })
  }

  // user menus
  const menusFromUser = ref<Menu[]>([]) // including menus from roles
  const sidebarMenus = ref<ShallowNavigationMenuItem[]>([])
  const sidebarMenuPathSet = ref<Set<string>>(new Set())
  const setUserDynamicMenus = (
    newRolesFromUser: Role[],
    newMenusFromUser: Menu[]
  ) => {
    sidebarMenuPathSet.value.clear()
    // including menus and menus from roles
    menusFromUser.value = [...newMenusFromUser, ...newRolesFromUser.map(role => role.menus ?? []).flat()]
    menusFromUser.value.forEach(menu => (menu.staticRouteKeys?.forEach(key => sidebarMenuPathSet.value.add(key))))

    const menuItems = bizMenus.value as any[]

    sidebarMenus.value = (menuMode.value === 'static' ? menuItems : hideNoPermissionMenus(menuItems as ShallowNavigationMenuItem[], sidebarMenuPathSet.value)) as ShallowNavigationMenuItem[]
  }
  watch([loginUserRoles, loginUserMenus, bizMenus], ([newRoles, newMenus]) => {
    setUserDynamicMenus(newRoles, newMenus)
  }, { immediate: true })

  // 把某个菜单展开，并展开它所有父菜单
  // 并把其他菜单折叠
  const expandSidebarMenu = (path: string) => {
    const expandRecursively = (menus: ShallowNavigationMenuItem[]): boolean => {
      let found = false
      for (const menu of menus) {
        if (menu.to === path) {
          found = true
        } else if (menu.children) {
          const childFound = expandRecursively(menu.children as ShallowNavigationMenuItem[])
          if (childFound) {
            found = true
            menu.open = true // 展开包含目标路径的父菜单
            menu.defaultOpen = true
          }
        }
      }
      return found
    }

    // 直接在原数组上操作，保持数组引用不变
    expandRecursively(sidebarMenus.value as ShallowNavigationMenuItem[])
  }

  const disabledMenuPathSet = computed<Set<string>>(() => {
    const set = new Set<string>()
    // 菜单禁用的，代码写死的
    flattenBizMenus.value.forEach((menu) => {
      if (menu.disabled)
        set.add(menu.to as string)
    })

    // 用户菜单列表禁用的
    menusFromUser.value.forEach((menu) => {
      if (menu.disabled && menu.staticRouteKeys)
        menu.staticRouteKeys.forEach(key => set.add(key))
    })
    return set
  })

  // breadcrumb
  const sidebarMenusAndConstantMenus = computed<ShallowNavigationMenuItem[]>(() => {
    const result: ShallowNavigationMenuItem[] = []

    result.push(...(constantMenus.value as any[]))

    result.push(...(sidebarMenus.value as any[]))
    return result
  })
  const breadcrumbs = ref<ShallowBreadcrumbItem[]>([])
  function getBreadcrumbs(
    current: string,
    menus: ShallowNavigationMenuItem[] = sidebarMenusAndConstantMenus.value
  ): ShallowBreadcrumbItem[] {
    for (const menu of menus) {
      if (menu.to === current) {
        return [transformMenuToBreadcrumb(menu)]
      }

      if (menu.children) {
        const result = getBreadcrumbs(current, menu.children)
        if (result.length > 0) {
          return [transformMenuToBreadcrumb(menu), ...result]
        }
      }
    }
    return []
  }

  function transformMenuToBreadcrumb(menu: ShallowNavigationMenuItem): ShallowBreadcrumbItem {
    const { children, label, icon, to } = menu
    const breadcrumb: ShallowBreadcrumbItem = { label, icon, to }
    if (children?.length) {
      breadcrumb.children = children.map(transformMenuToBreadcrumb)
    }

    return breadcrumb
  }

  return {
    constantMenus,
    constantMenuPathSet,
    bizMenus,
    flattenBizMenus,
    bizMenuPathSet,
    menusFromUser,
    sidebarMenus,
    sidebarMenuPathSet,
    expandSidebarMenu,
    setUserDynamicMenus,
    disabledMenuPathSet,
    // breadcrumb
    breadcrumbs,
    getBreadcrumbs
  }
}

export const useSidebarMenus = createSharedComposable(_useSidebarMenus)
