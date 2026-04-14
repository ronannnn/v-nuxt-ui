// POST /api/v1/flows/nodes/edges
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const edge = createFlowEdge(body)
  return { error: null, data: edge }
})
