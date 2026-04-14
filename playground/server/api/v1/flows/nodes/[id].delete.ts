// DELETE /api/v1/flows/nodes/:id
export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  deleteFlowNodes([id])
  return { error: null, data: null }
})
