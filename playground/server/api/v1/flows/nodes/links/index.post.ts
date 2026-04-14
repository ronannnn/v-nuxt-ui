// POST /api/v1/flows/nodes/links
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const link = createFlowLink(body)
  return { error: null, data: link }
})
