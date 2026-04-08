// POST /api/v1/table-columns/user-config
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { tblName, configs } = body

  // Find table by tblName
  const table = getTables().find(t => t.tblName === tblName)
  if (!table) {
    throw createError({ statusCode: 404, message: 'Table not found' })
  }

  // For mock, use fixed userId
  const userId = 1

  // Get existing user table columns for this user
  const existingUserCols = getUserTableColumnsByUserId(userId)
  const tableColumns = getTableColumnsByTableId(table.id)
  const tableColumnIds = tableColumns.map(c => c.id)
  const existingForTable = existingUserCols.filter(uc => tableColumnIds.includes(uc.tableColumnId))

  // Upsert each config
  for (const config of configs) {
    const existing = existingForTable.find(uc => uc.tableColumnId === config.tableColumnId)
    if (existing) {
      updateUserTableColumn({ id: existing.id, ...config })
    } else {
      createUserTableColumn({ userId, tableColumnId: config.tableColumnId, ...config })
    }
  }

  return { error: null, data: null }
})
