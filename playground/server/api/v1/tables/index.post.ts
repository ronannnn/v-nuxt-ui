// POST /api/v1/tables
import { createTable } from '../../utils/mockData'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const table = createTable(body)
  return { error: null, data: table }
})