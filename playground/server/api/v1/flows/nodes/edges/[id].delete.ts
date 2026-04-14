// DELETE /api/v1/flows/nodes/edges/:id
export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  deleteFlowEdges([id])
  return { error: null, data: null }
})
