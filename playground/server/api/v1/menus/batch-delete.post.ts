// POST /api/v1/menus/batch-delete
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  deleteMenus(body.ids || [])
  return { error: null, data: null }
})
