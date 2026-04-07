// GET /api/v1/menus/:id
export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  const menu = getMenuById(id)
  if (!menu) {
    throw createError({ statusCode: 404, message: 'Menu not found' })
  }
  return { error: null, data: menu }
})
