// DELETE /api/v1/tables/:id
export default defineEventHandler(async (event) => {
  const id = parseInt(getRouterParam(event, 'id') || '0')
  deleteTables([id])
  return { error: null, data: null }
})
