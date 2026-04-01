import { createSharedComposable } from '@vueuse/core'
import { useAuth } from './useAuth'
import { ref, watch } from 'vue'

export const _usePermission = () => {
  const { loginUserRoles, loginUserMenus } = useAuth()
  const permissions = ref<Set<string>>(new Set())

  const setUserDynamicPermissions = (
    userRoles: Model.Role[] = [],
    userMenus: Model.Menu[] = []
  ) => {
    const allMenus: Model.Menu[] = []

    // 收集角色菜单
    userRoles.forEach((role) => {
      if (role.menus?.length) {
        allMenus.push(...role.menus)
      }
    })

    // 收集用户菜单
    if (userMenus.length) {
      allMenus.push(...userMenus)
    }

    // 去重并收集权限
    const permSet = new Set<string>()
    const processedMenus = new Set<number>()

    allMenus.forEach((menu) => {
      if (!processedMenus.has(menu.id)) {
        processedMenus.add(menu.id)
        if (menu.permission?.trim()) {
          permSet.add(menu.permission.trim())
        }
      }
    })

    permissions.value = permSet
  }
  watch([loginUserRoles, loginUserMenus], ([newRoles, newMenus]) => {
    setUserDynamicPermissions(newRoles, newMenus)
  }, { immediate: true })

  const hasPermissions = (perms: string[] | string): boolean => {
    if (!perms) return false

    if (typeof perms === 'string') {
      return permissions.value.has(perms.trim())
    }

    if (!Array.isArray(perms) || perms.length === 0) return false

    return perms.every(perm =>
      typeof perm === 'string'
      && perm.trim()
      && permissions.value.has(perm.trim())
    )
  }

  const hasAnyPermission = (perms: string[]): boolean => {
    if (!Array.isArray(perms) || perms.length === 0) return false

    return perms.some(perm =>
      typeof perm === 'string'
      && perm.trim()
      && permissions.value.has(perm.trim())
    )
  }

  return {
    setUserDynamicPermissions,
    hasPermissions,
    hasAnyPermission
  }
}

export const usePermission = createSharedComposable(_usePermission)
