// POST /api/v1/users/list
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const result = queryUsers(body)
  return { error: null, data: result }
})
