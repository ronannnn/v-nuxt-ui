// PUT /api/v1/users - update user
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const user = updateUser(body)
  if (!user) {
    throw createError({ statusCode: 404, message: 'User not found' })
  }
  return { error: null, data: user }
})
