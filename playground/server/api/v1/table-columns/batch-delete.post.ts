// POST /api/v1/table-columns/batch-delete
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { ids } = body
  deleteTableColumns(ids)
  return { error: null, data: null }
})
