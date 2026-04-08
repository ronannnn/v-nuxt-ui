// DELETE /api/v1/table-columns/:id
export default defineEventHandler(async (event) => {
  const id = parseInt(getRouterParam(event, 'id') || '0')
  deleteTableColumns([id])
  return { error: null, data: null }
})
