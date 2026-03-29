// DELETE /api/v1/users/:id
export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  deleteUsers([id])
  return { error: null, data: null }
})
