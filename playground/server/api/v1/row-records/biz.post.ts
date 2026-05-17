export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const result = queryRowRecords(body.tableName, body.rowId)
  return {
    error: null,
    data: result
  }
})
