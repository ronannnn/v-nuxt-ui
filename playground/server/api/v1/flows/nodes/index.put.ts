// PUT /api/v1/flows/nodes
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const node = updateFlowNode(body)
  if (!node) {
    throw createError({ statusCode: 404, message: 'Flow node not found' })
  }
  return { error: null, data: node }
})
