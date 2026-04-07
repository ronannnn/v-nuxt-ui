// POST /api/v1/menus - create menu
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const menu = createMenu(body)
  return { error: null, data: menu }
})
