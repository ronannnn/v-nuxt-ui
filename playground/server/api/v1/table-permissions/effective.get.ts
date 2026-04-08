// GET /api/v1/table-permissions/effective?tblName=xxx
import { getTables, getTablePermissions, getTableColumnPermissionsByTablePermissionId, getTableColumnsByTableId } from '../../utils/mockData'
import type { EffectiveTablePermission, ColumnEffectivePerm } from '../../utils/mockData'

export default defineEventHandler(async (event) => {
  const tblName = getQuery(event).tblName as string
  
  // Find table by tblName
  const table = getTables().find(t => t.tblName === tblName)
  if (!table) {
    throw createError({ statusCode: 404, message: 'Table not found' })
  }

  // Get table columns
  const tableColumns = getTableColumnsByTableId(table.id)

  // Get table permissions for this table
  const tablePermissions = getTablePermissions().filter(p => p.tableId === table.id)

  // Determine effective permissions (simplified - would use role-based logic)
  // For mock: if any permission has canView/canEdit, use that
  let canViewTable = false
  let canEditTable = false
  
  for (const tp of tablePermissions) {
    if (tp.canView) canViewTable = true
    if (tp.canEdit) canEditTable = true
  }

  // Build column permissions
  const columns: Record<string, ColumnEffectivePerm> = {}
  for (const col of tableColumns) {
    let canView = col.visible
    let canEdit = false

    // Check column-specific permissions
    for (const tp of tablePermissions) {
      const colPerms = getTableColumnPermissionsByTablePermissionId(tp.id)
      const colPerm = colPerms.find(cp => cp.columnKey === col.columnKey)
      if (colPerm) {
        canView = colPerm.canView ?? canView
        if (colPerm.canEdit) canEdit = true
      }
    }

    columns[col.columnKey] = { canView, canEdit }
  }

  const result: EffectiveTablePermission = {
    isConfigured: tablePermissions.length > 0,
    canViewTable,
    canEditTable,
    columns
  }

  return { error: null, data: result }
})