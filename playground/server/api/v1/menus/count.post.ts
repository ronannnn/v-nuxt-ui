// POST /api/v1/menus/count
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const result = queryMenus(body)
  return { error: null, data: result.total }
})
