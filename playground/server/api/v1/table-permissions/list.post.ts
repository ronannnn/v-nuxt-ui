// POST /api/v1/table-permissions/list
import { getTablePermissions } from '../../utils/mockData'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  
  // For list query, filter by tableId if provided
  let permissions = getTablePermissions()
  
  if (body.tableId) {
    permissions = permissions.filter(p => p.tableId === body.tableId)
  }

  return { 
    error: null, 
    data: {
      list: permissions,
      total: permissions.length,
      pageNum: 1,
      pageSize: permissions.length
    }
  }
})