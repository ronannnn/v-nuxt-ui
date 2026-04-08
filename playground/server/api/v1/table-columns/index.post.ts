// POST /api/v1/table-columns
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const column = createTableColumn(body)
  return { error: null, data: column }
})
