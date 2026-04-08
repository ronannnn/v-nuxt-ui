// POST /api/v1/table-columns/batch-delete
import { deleteTableColumns } from '../../utils/mockData'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { ids } = body
  deleteTableColumns(ids)
  return { error: null, data: null }
})