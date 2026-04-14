// POST /api/v1/flows/nodes
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const node = createFlowNode(body)
  return { error: null, data: node }
})
