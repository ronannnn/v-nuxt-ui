// POST /api/v1/table-columns
import { createTableColumn } from '../../utils/mockData'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const column = createTableColumn(body)
  return { error: null, data: column }
})