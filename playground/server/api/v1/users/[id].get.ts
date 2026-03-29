// GET /api/v1/users/:id
export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  const user = getUserById(id)
  if (!user) {
    throw createError({ statusCode: 404, message: 'User not found' })
  }
  return { error: null, data: user }
})
