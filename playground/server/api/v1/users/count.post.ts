// POST /api/v1/users/count
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const result = queryUsers(body)
  return { error: null, data: result.total }
})
