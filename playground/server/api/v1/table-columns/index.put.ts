// PUT /api/v1/table-columns
import { updateTableColumn } from '../../utils/mockData'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const column = updateTableColumn(body)
  if (!column) {
    throw createError({ statusCode: 404, message: 'TableColumn not found' })
  }
  return { error: null, data: column }
})