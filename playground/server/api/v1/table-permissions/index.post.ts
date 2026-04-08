// POST /api/v1/table-permissions
import { createTablePermission } from '../../utils/mockData'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const permission = createTablePermission(body)
  return { error: null, data: permission }
})