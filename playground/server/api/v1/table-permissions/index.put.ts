// PUT /api/v1/table-permissions
import { updateTablePermission } from '../../utils/mockData'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const permission = updateTablePermission(body)
  if (!permission) {
    throw createError({ statusCode: 404, message: 'TablePermission not found' })
  }
  return { error: null, data: permission }
})