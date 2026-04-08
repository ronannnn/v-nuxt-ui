<script setup lang="ts">
import type { MergedTableColumn, UserTableColumn, Table } from '#v/types'
import { useTableColumnPermission } from '#v/composables/table/useTableColumnPermission'
import UserTableColumnModal from './UserTableColumnModal.vue'
import { ref, h, onMounted } from 'vue'
</script>

<script lang="ts">
const { tables, fetchTables, fetchMergedColumns, saveUserColumns } = useTableColumnPermission()

const selectedTable = ref<Table | null>(null)
const mergedColumns = ref<MergedTableColumn[]>([])
const editingColumn = ref<MergedTableColumn | null>(null)
const showColumnModal = ref(false)
const saving = ref(false)

async function onTableSelect(table: Table) {
  selectedTable.value = table
  mergedColumns.value = await fetchMergedColumns(table.tblName ?? '')
}

function onEditColumn(column: MergedTableColumn) {
  editingColumn.value = column
  showColumnModal.value = true
}

async function onColumnSave(config: UserTableColumn) {
  if (!selectedTable.value) return

  saving.value = true
  try {
    await saveUserColumns(selectedTable.value.tblName ?? '', [config])
    mergedColumns.value = await fetchMergedColumns(selectedTable.value.tblName ?? '')
    showColumnModal.value = false
  } finally {
    saving.value = false
  }
}

const columns = [
  {
    accessorKey: 'label',
    header: '列名',
    cell: ({ row }: { row: { original: MergedTableColumn } }) => row.original.label
  },
  {
    accessorKey: 'columnKey',
    header: '列标识'
  },
  {
    accessorKey: 'width',
    header: '宽度',
    cell: ({ row }: { row: { original: MergedTableColumn } }) => row.original.width
  },
  {
    accessorKey: 'order',
    header: '顺序',
    cell: ({ row }: { row: { original: MergedTableColumn } }) => row.original.order
  },
  {
    accessorKey: 'fixed',
    header: '固定',
    cell: ({ row }: { row: { original: MergedTableColumn } }) => row.original.fixed || '-'
  },
  {
    accessorKey: 'visible',
    header: '可见',
    cell: ({ row }: { row: { original: MergedTableColumn } }) => row.original.visible ? '是' : '否'
  },
  {
    accessorKey: 'actions',
    header: '操作',
    cell: ({ row }: { row: { original: MergedTableColumn } }) => {
      if (!row.original.canEdit) return '-'
      return h('UButton', {
        size: 'sm',
        variant: 'link',
        label: '编辑',
        onClick: () => onEditColumn(row.original)
      })
    }
  }
]

onMounted(fetchTables)
</script>

<template>
  <div class="flex gap-4 h-full">
    <div class="w-64 border-r pr-4">
      <div class="font-bold mb-2">
        选择 Table
      </div>
      <div
        v-for="table in tables"
        :key="table.id"
        class="p-2 cursor-pointer rounded mb-1"
        :class="{ 'bg-primary text-white': selectedTable?.id === table.id }"
        @click="onTableSelect(table)"
      >
        {{ table.label }} ({{ table.tblName }})
      </div>
    </div>

    <div class="flex-1">
      <template v-if="selectedTable">
        <div class="font-bold mb-2">
          列配置 - {{ selectedTable.label }}
        </div>
        <UTable :data="mergedColumns" :columns="columns" />
      </template>
      <div v-else class="text-dimmed">
        请选择左侧 Table 查看列配置
      </div>
    </div>

    <UserTableColumnModal
      v-if="editingColumn"
      v-model:open="showColumnModal"
      :column="editingColumn"
      :loading="saving"
      @save="onColumnSave"
      @close="showColumnModal = false"
    />
  </div>
</template>
