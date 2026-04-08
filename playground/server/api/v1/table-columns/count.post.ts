// POST /api/v1/roles/count
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const result = queryTableColumns(body)
  return { error: null, data: result.total }
})
