// POST /api/v1/table-permissions/batch-delete
import { deleteTablePermissions } from '../../utils/mockData'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { ids } = body
  deleteTablePermissions(ids)
  return { error: null, data: null }
})