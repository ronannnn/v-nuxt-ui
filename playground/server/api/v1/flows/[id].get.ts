// GET /api/v1/flows/:id
export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  const flow = getFlowById(id)
  if (!flow) {
    throw createError({ statusCode: 404, message: 'Flow not found' })
  }
  return { error: null, data: flow }
})
