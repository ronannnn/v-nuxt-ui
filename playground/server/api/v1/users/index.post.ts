// POST /api/v1/users - create user
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { tablePermissions, ...userData } = body
  const user = createUser(userData)
  if (tablePermissions && Array.isArray(tablePermissions)) {
    saveUserTablePermissions(user.id, tablePermissions)
  }
  return { error: null, data: enrichUserWithTablePermissions(user) }
})
