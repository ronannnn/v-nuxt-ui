// GET /api/v1/table-columns/:id
export default defineEventHandler(async (event) => {
  const id = parseInt(getRouterParam(event, 'id') || '0')
  const column = getTableColumnById(id)
  if (!column) {
    throw createError({ statusCode: 404, message: 'TableColumn not found' })
  }
  return { error: null, data: column }
})
