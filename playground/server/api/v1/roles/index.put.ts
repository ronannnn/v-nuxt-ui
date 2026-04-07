// PUT /api/v1/roles - update role
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const role = updateRole(body)
  if (!role) {
    throw createError({ statusCode: 404, message: 'Role not found' })
  }
  return { error: null, data: role }
})
