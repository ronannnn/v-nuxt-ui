// PUT /api/v1/menus - update menu
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const menu = updateMenu(body)
  if (!menu) {
    throw createError({ statusCode: 404, message: 'Menu not found' })
  }
  return { error: null, data: menu }
})
