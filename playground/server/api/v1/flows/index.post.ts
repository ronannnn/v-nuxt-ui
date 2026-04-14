// POST /api/v1/flows
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const flow = createFlow(body)
  return { error: null, data: flow }
})
