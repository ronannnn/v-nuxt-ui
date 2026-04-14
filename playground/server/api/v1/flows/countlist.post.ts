// POST /api/v1/flows/countlist
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const result = queryFlows(body)
  return { error: null, data: result }
})
