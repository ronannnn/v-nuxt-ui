// PUT /api/v1/flows/nodes/edges
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const edge = updateFlowEdge(body)
  if (!edge) {
    throw createError({ statusCode: 404, message: 'Flow edge not found' })
  }
  return { error: null, data: edge }
})
