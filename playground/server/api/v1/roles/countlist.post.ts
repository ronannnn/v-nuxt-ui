// POST /api/v1/roles/countlist
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const result = queryRoles(body)
  return { error: null, data: result }
})
