// DELETE /api/v1/menus/:id
export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  deleteMenus([id])
  return { error: null, data: null }
})
