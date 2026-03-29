// POST /api/v1/departments/countlist
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  let filtered = [...getDepartments()]

  // Simple search by name
  if (body.whereQuery?.items) {
    for (const item of body.whereQuery.items) {
      if (!item.value) continue
      if (item.field === 'name' && (item.opr === 'like' || item.opr === 'start_like')) {
        filtered = filtered.filter(d =>
          d.name.toLowerCase().includes(String(item.value).toLowerCase())
        )
      }
    }
  }

  return {
    error: null,
    data: {
      list: filtered,
      total: filtered.length,
      pageNum: 1,
      pageSize: filtered.length
    }
  }
})
