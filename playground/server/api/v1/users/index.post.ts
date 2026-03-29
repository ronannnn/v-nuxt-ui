// POST /api/v1/users - create user
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const user = createUser(body)
  return { error: null, data: user }
})
