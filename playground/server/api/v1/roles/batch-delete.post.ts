// POST /api/v1/roles/batch-delete
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  deleteRoles(body.ids || [])
  return { error: null, data: null }
})
