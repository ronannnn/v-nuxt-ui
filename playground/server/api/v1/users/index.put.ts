// PUT /api/v1/users - update user
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { tablePermissions, ...userData } = body
  const user = updateUser(userData)
  if (!user) {
    throw createError({ statusCode: 404, message: 'User not found' })
  }
  if (tablePermissions !== undefined) {
    saveUserTablePermissions(user.id, Array.isArray(tablePermissions) ? tablePermissions : [])
  }
  return { error: null, data: enrichUserWithTablePermissions(user) }
})
