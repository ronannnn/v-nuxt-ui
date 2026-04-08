// PUT /api/v1/roles - update role
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { tablePermissions, ...roleData } = body
  const role = updateRole(roleData)
  if (!role) {
    throw createError({ statusCode: 404, message: 'Role not found' })
  }
  if (tablePermissions !== undefined) {
    saveRoleTablePermissions(role.id, Array.isArray(tablePermissions) ? tablePermissions : [])
  }
  return { error: null, data: enrichRoleWithTablePermissions(role) }
})
