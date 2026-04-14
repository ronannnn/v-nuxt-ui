// DELETE /api/v1/flows/nodes/links/:id
export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  deleteFlowLinks([id])
  return { error: null, data: null }
})
