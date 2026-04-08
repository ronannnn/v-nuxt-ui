// POST /api/v1/tables
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const table = createTable(body)
  return { error: null, data: table }
})
