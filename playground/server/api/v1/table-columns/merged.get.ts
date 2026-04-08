// GET /api/v1/table-columns/merged?tblName=xxx
import { getTables, getTableColumnsByTableId, getUserTableColumnsByTableColumnIds, getTablePermissions, getTableColumnPermissionsByTablePermissionId } from '../../utils/mockData'
import type { MergedTableColumn } from '../../utils/mockData'

export default defineEventHandler(async (event) => {
  const tblName = getQuery(event).tblName as string
  
  // Find table by tblName
  const table = getTables().find(t => t.tblName === tblName)
  if (!table) {
    throw createError({ statusCode: 404, message: 'Table not found' })
  }

  // Get table columns for this table
  const tableColumns = getTableColumnsByTableId(table.id)
  
  // For mock, use a fixed userId (in real app, would come from auth)
  const userId = 1
  const tableColumnIds = tableColumns.map(c => c.id)
  const userTableColumns = getUserTableColumnsByTableColumnIds(tableColumnIds, userId)
  
  // Get table permissions (simplified - would need role-based logic in real app)
  const tablePermissions = getTablePermissions().filter(p => p.tableId === table.id)
  
  // Build merged columns
  const mergedColumns: MergedTableColumn[] = tableColumns.map(col => {
    const userCol = userTableColumns.find(uc => uc.tableColumnId === col.id)
    const colPerms = tablePermissions.flatMap(p => getTableColumnPermissionsByTablePermissionId(p.id))
    const colPerm = colPerms.find(cp => cp.columnKey === col.columnKey)

    // Default: use table column definition
    let canView = col.visible
    let canEdit = false

    // If user has custom settings, use them
    if (userCol) {
      canView = userCol.visible ?? col.visible
    }

    // If column permission exists, apply it
    if (colPerm) {
      canView = colPerm.canView ?? canView
      canEdit = colPerm.canEdit ?? false
    } else {
      // If no column permission but table permission exists, use table-level
      for (const tp of tablePermissions) {
        if (tp.canEdit) {
          canEdit = true
          break
        }
      }
    }

    return {
      tableColumnId: col.id,
      columnKey: col.columnKey,
      label: col.label,
      i18nKey: col.labelI18nKey,
      order: userCol?.order ?? col.order,
      width: userCol?.width ?? col.width,
      fixed: userCol?.fixed ?? col.fixed,
      visible: canView,
      canView,
      canEdit
    }
  })

  // Sort by order
  mergedColumns.sort((a, b) => a.order - b.order)

  return { error: null, data: mergedColumns }
})