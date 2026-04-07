import { ref } from 'vue'
import { useTableApi, useTableColumnApi, useTablePermissionApi } from '#v/composables/api'
import type { Table, TableColumn, UserTableColumn, MergedTableColumn, EffectiveTablePermission } from '#v/types'

export function useTableColumnPermission() {
  const tableApi = useTableApi()
  const tableColumnApi = useTableColumnApi()
  const tablePermissionApi = useTablePermissionApi()

  const tables = ref<Table[]>([])
  const tablesLoading = ref(false)

  async function fetchTables() {
    tablesLoading.value = true
    try {
      const { data } = await tableApi.list({ pagination: { pageNum: 0, pageSize: 0 } })
      if (data.value.data) {
        tables.value = data.value.data.list
      }
    } finally {
      tablesLoading.value = false
    }
  }

  async function fetchColumnsByTableId(tableId: number): Promise<TableColumn[]> {
    const { data } = await tableColumnApi.list({
      pagination: { pageNum: 0, pageSize: 0 },
      whereQuery: { items: [{ field: 'tableId', opr: 'eq', value: tableId }] }
    })
    return data.value.data?.list ?? []
  }

  async function fetchMergedColumns(tblName: string): Promise<MergedTableColumn[]> {
    const { data } = await tableColumnApi.getMergedColumns(tblName)
    return data.value.data ?? []
  }

  async function fetchEffectivePermissions(tblName: string): Promise<EffectiveTablePermission | null> {
    const { data } = await tablePermissionApi.getEffectivePermissions(tblName)
    return data.value.data ?? null
  }

  async function saveUserColumns(tblName: string, configs: UserTableColumn[]) {
    await tableColumnApi.saveUserColumns(tblName, configs)
  }

  return {
    tables,
    tablesLoading,
    fetchTables,
    fetchColumnsByTableId,
    fetchMergedColumns,
    fetchEffectivePermissions,
    saveUserColumns
  }
}
