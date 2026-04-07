// DELETE /api/v1/roles/:id
export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  deleteRoles([id])
  return { error: null, data: null }
})
