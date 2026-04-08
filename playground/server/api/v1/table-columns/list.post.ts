// POST /api/v1/table-columns/list
import { queryTableColumns } from '../../utils/mockData'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const result = queryTableColumns(body)
  return { error: null, data: result }
})