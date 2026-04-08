// POST /api/v1/tables/batch-delete
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { ids } = body
  deleteTables(ids)
  // Also delete related table columns
  deleteTableColumns(ids.map((id: number) => id))
  return { error: null, data: null }
})
