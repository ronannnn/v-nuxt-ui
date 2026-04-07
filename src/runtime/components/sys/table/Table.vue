<script setup lang="ts">
import type { VColumn, Table } from '#v/types'
import { useOverlay } from '@nuxt/ui/composables'
import { useTableApi, useTableColumnApi } from '#v/composables/api'
import { getOprColumns } from '#v/constants'
import TableColumnModal from './TableColumnModal.vue'
import TablePage from '#v/components/table/Page.vue'
import CreateModal from './CreateModal.vue'
import { h, ref, watch } from 'vue'

const overlay = useOverlay()
const tableColumnModal = overlay.create(TableColumnModal)
const createModal = overlay.create(CreateModal)

const columnCounts = ref<Record<number, number>>({})

const columns: VColumn<Table>[] = [
  {
    accessorKey: 'tblName',
    header: '表名',
    sortOption: true,
    filterOption: {
      type: 'input',
      initHide: false
    }
  },
  {
    accessorKey: 'label',
    header: '显示名',
    sortOption: true,
    filterOption: {
      type: 'input',
      initHide: false
    }
  },
  {
    accessorKey: 'columnCount',
    header: '列数',
    cell: ({ row }) => columnCounts.value[row.original.id] ?? '-'
  },
  ...getOprColumns<Table>()
]

const tablePageRef = ref<any>(null)

async function fetchColumnCounts(tables: Table[]) {
  const tableColumnApi = useTableColumnApi()
  const newCounts: Record<number, number> = {}
  await Promise.all(
    tables.map(async (table) => {
      const { data } = await tableColumnApi.count({
        whereQuery: {
          items: [{ field: 'tableId', value: table.id, opr: 'eq' }]
        }
      })
      if (data.value.data !== undefined && data.value.data !== null) {
        newCounts[table.id] = data.value.data
      }
    })
  )
  columnCounts.value = { ...columnCounts.value, ...newCounts }
}

function getExpandVNode(row: Table) {
  const count = columnCounts.value[row.id] ?? '-'
  return h('div', { class: 'p-4 text-sm text-dimmed' }, [
    h('div', { class: 'font-medium mb-2' }, `Table: ${row.tblName}`),
    h('div', {}, `显示名: ${row.label}`),
    h('div', {}, `列数: ${count}`)
  ])
}

const extraRowActions = [
  {
    label: '编辑',
    icon: 'i-lucide-edit',
    fnWithModal: async (row: Table) => {
      const result = await createModal.open({ model: { ...row } }).result
      return result
    }
  },
  {
    label: '配置列',
    icon: 'i-lucide-settings',
    fnWithModal: async (row: Table) => {
      const result = await tableColumnModal.open({ table: row }).result
      return result
    }
  }
]

watch(
  () => tablePageRef.value?.data,
  async (newData) => {
    if (newData && newData.length > 0) {
      await fetchColumnCounts(newData)
    }
  },
  { immediate: true }
)
</script>

<template>
  <TablePage
    ref="tablePageRef"
    name="sys-table"
    cn-name="Table 配置"
    :use-api-group="useTableApi"
    :biz-columns="columns"
    :expandable="true"
    :expand-v-node="getExpandVNode"
    :extra-row-actions="extraRowActions"
    @edit-row-from-modal="async (row: Table) => {
      const result = await createModal.open({ model: { ...row } }).result
      return result === true
    }"
  />
</template>
