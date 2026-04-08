// GET /api/v1/tables/:id
import { getTableById } from '../../utils/mockData'

export default defineEventHandler(async (event) => {
  const id = parseInt(getRouterParam(event, 'id') || '0')
  const table = getTableById(id)
  if (!table) {
    throw createError({ statusCode: 404, message: 'Table not found' })
  }
  return { error: null, data: table }
})