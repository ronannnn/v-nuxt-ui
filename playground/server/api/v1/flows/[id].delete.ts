// DELETE /api/v1/flows/:id
export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  deleteFlows([id])
  return { error: null, data: null }
})
