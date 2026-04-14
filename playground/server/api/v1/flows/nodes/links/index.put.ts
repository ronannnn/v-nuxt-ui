// PUT /api/v1/flows/nodes/links
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const link = updateFlowLink(body)
  if (!link) {
    throw createError({ statusCode: 404, message: 'Flow link not found' })
  }
  return { error: null, data: link }
})
