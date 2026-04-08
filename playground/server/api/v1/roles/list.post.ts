// POST /api/v1/roles/list
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const result = queryRoles(body)
  return {
    error: null,
    data: {
      ...result,
      list: result.list.map(r => enrichRoleWithTablePermissions(r))
    }
  }
})
