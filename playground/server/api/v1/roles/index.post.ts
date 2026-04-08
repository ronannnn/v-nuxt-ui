// POST /api/v1/roles - create role
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { tablePermissions, ...roleData } = body
  const role = createRole(roleData)
  if (tablePermissions && Array.isArray(tablePermissions)) {
    saveRoleTablePermissions(role.id, tablePermissions)
  }
  return { error: null, data: enrichRoleWithTablePermissions(role) }
})
