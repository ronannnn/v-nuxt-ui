// PUT /api/v1/tables
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const table = updateTable(body)
  if (!table) {
    throw createError({ statusCode: 404, message: 'Table not found' })
  }
  return { error: null, data: table }
})
