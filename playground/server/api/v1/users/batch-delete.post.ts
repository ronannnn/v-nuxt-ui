// POST /api/v1/users/batch-delete
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  deleteUsers(body.ids || [])
  return { error: null, data: null }
})
