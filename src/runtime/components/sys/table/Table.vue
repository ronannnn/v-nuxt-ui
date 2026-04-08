<script setup lang="ts">
import type { VColumn, Table } from '#v/types'
import { useOverlay } from '@nuxt/ui/composables'
import { useTableApi, useTableColumnApi, useTablePermissionApi } from '#v/composables/api'
import { getOprColumns } from '#v/constants'
import TablePage from '#v/components/table/Page.vue'
import CreateModal from './CreateModal.vue'
import { h, ref, watch } from 'vue'

const overlay = useOverlay()
const createModal = overlay.create(CreateModal)

interface TableMeta {
  columnCount: number
  permissionCount: number
}

const tableMeta = ref<Record<number, TableMeta>>({})

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
    accessorKey: 'meta',
    header: '列数',
    cell: ({ row }) => tableMeta.value[row.original.id]?.columnCount ?? '-'
  },
  {
    accessorKey: 'permissionCount',
    header: '权限数',
    cell: ({ row }) => tableMeta.value[row.original.id]?.permissionCount ?? '-'
  },
  ...getOprColumns<Table>()
]

const tablePageRef = ref<any>(null)

async function fetchTableMeta(tables: Table[]) {
  const tableColumnApi = useTableColumnApi()
  const tablePermissionApi = useTablePermissionApi()
  const newMeta: Record<number, TableMeta> = {}

  await Promise.all(
    tables.map(async (table) => {
      const [columnResult, permissionResult] = await Promise.all([
        tableColumnApi.list({
          pagination: { pageNum: 1, pageSize: 1 },
          whereQuery: {
            items: [{ field: 'tableId', value: table.id, opr: 'eq' }]
          }
        }),
        tablePermissionApi.list({
          pagination: { pageNum: 1, pageSize: 1 },
          whereQuery: {
            items: [{ field: 'tableId', value: table.id, opr: 'eq' }]
          }
        })
      ])

      newMeta[table.id] = {
        columnCount: columnResult.data.value?.data?.total ?? 0,
        permissionCount: permissionResult.data.value?.data?.total ?? 0
      }
    })
  )

  tableMeta.value = { ...tableMeta.value, ...newMeta }
}

function getExpandVNode(row: Table) {
  const meta = tableMeta.value[row.id]
  return h('div', { class: 'p-4 text-sm text-dimmed' }, [
    h('div', { class: 'font-medium mb-2' }, `Table: ${row.tblName}`),
    h('div', {}, `显示名: ${row.label}`),
    h('div', {}, `列数: ${meta?.columnCount ?? '-'}`),
    h('div', {}, `权限配置数: ${meta?.permissionCount ?? '-'}`),
    h('div', {}, `创建时间: ${row.createdAt ? new Date(row.createdAt).toLocaleString() : '-'}`),
    h('div', {}, `更新时间: ${row.updatedAt ? new Date(row.updatedAt).toLocaleString() : '-'}`)
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
  }
]

watch(
  () => tablePageRef.value?.data,
  async (newData) => {
    if (newData && newData.length > 0) {
      await fetchTableMeta(newData)
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
