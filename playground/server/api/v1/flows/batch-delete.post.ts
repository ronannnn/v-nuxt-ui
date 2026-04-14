// POST /api/v1/flows/batch-delete
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  deleteFlows(body.ids || [])
  return { error: null, data: null }
})
