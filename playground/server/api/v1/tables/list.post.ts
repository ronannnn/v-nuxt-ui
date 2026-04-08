// POST /api/v1/tables/list
import { queryTables } from '../../utils/mockData'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const result = queryTables(body)
  return { error: null, data: result }
})