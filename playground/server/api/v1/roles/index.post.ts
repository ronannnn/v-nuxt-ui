// POST /api/v1/roles - create role
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const role = createRole(body)
  return { error: null, data: role }
})
