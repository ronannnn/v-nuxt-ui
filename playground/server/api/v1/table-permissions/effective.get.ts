import type { ColumnEffectivePerm, EffectiveTablePermission } from '#v/types'

// GET /api/v1/table-permissions/effective?tblName=xxx&userId=xxx
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const tblName = query.tblName as string
  const userId = Number(query.userId) || 1 // default to user 1

  // Find table by tblName
  const table = getTables().find(t => t.tblName === tblName)
  if (!table) {
    throw createError({ statusCode: 404, message: 'Table not found' })
  }

  const tableColumns = getTableColumnsByTableId(table.id)

  // Get user
  const user = getUserById(userId)
  if (!user) {
    throw createError({ statusCode: 404, message: 'User not found' })
  }

  // Collect user's direct permissions for this table
  const userPermIds = user.tablePermissions || []
  const userDirectPerms = userPermIds
    .map(id => getTablePermissionById(id))
    .filter(p => p && p.tableId === table.id)

  // Collect role-based permissions for this table
  // Note: In mock data, user-role M2M is not implemented.
  // We look up all roles that have tablePermissions for this table.
  const allRoles = getRoles()
  const rolePermsForTable: ReturnType<typeof getTablePermissionById>[] = []
  for (const role of allRoles) {
    const rolePermIds = role.tablePermissions || []
    for (const permId of rolePermIds) {
      const perm = getTablePermissionById(permId)
      if (perm && perm.tableId === table.id) {
        rolePermsForTable.push(perm)
      }
    }
  }

  // Merge: user direct perms take priority over role perms
  // If user has direct permissions for this table, use those exclusively;
  // otherwise fall back to role-based permissions (union of all roles, simplified)
  const effectivePerms = userDirectPerms.length > 0 ? userDirectPerms : rolePermsForTable

  // Compute table-level permissions (UNION - most permissive wins)
  let canViewTable = false
  let canEditTable = false
  for (const tp of effectivePerms) {
    if (tp!.canView) canViewTable = true
    if (tp!.canEdit) canEditTable = true
  }

  // Compute column-level permissions
  const columns: Record<string, ColumnEffectivePerm> = {}
  for (const col of tableColumns) {
    let canView = col.visible
    let canEdit = false

    for (const tp of effectivePerms) {
      const colPerms = getTableColumnPermissionsByTablePermissionId(tp!.id)
      const colPerm = colPerms.find(cp => cp.columnKey === col.columnKey)
      if (colPerm) {
        canView = colPerm.canView ?? canView
        if (colPerm.canEdit) canEdit = true
      }
    }

    columns[col.columnKey] = { canView, canEdit }
  }

  const result: EffectiveTablePermission = {
    isConfigured: effectivePerms.length > 0,
    canViewTable,
    canEditTable,
    columns
  }

  return { error: null, data: result }
})
