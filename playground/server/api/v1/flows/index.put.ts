// PUT /api/v1/flows
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const flow = updateFlow(body)
  if (!flow) {
    throw createError({ statusCode: 404, message: 'Flow not found' })
  }
  return { error: null, data: flow }
})
