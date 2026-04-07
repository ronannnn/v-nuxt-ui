// GET /api/v1/roles/:id
export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  const role = getRoleById(id)
  if (!role) {
    throw createError({ statusCode: 404, message: 'Role not found' })
  }
  return { error: null, data: role }
})
