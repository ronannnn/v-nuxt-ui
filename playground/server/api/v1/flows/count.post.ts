// POST /api/v1/flows/count
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const result = queryFlows(body)
  return { error: null, data: result.total }
})
