// POST /api/v1/menus/list
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const result = queryMenus(body)
  return { error: null, data: result }
})
