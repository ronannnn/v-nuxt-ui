<script setup lang="ts">
import type { TableColumn, Table } from '#v/types'
import { useTableColumnApi } from '#v/composables/api'
import { ref, onMounted } from 'vue'

const props = defineProps<{
  table: Table
}>()

const emit = defineEmits<{
  close: [boolean]
  save: [TableColumn[]]
}>()

const tableColumnApi = useTableColumnApi()
const columns = ref<TableColumn[]>([])
const loading = ref(false)

async function fetchColumns() {
  loading.value = true
  const { data } = await tableColumnApi.list({
    pagination: { pageNum: 0, pageSize: 0 },
    orderQuery: [{ field: 'order', order: 'asc' }],
    whereQuery: {
      items: [{ field: 'tableId', value: props.table.id, opr: 'eq' }]
    }
  })
  if (data.value.data) {
    columns.value = data.value.data.list
  }
  loading.value = false
}

function addColumn() {
  const maxOrder = columns.value.reduce((max, col) => Math.max(max, col.order), 0)
  columns.value.push({
    id: 0,
    tableId: props.table.id,
    columnKey: '',
    label: '',
    order: maxOrder + 1,
    width: 100,
    fixed: '',
    visible: true,
    version: 0,
    createdAt: '',
    updatedAt: ''
  } as TableColumn)
}

function removeColumn(index: number) {
  columns.value.splice(index, 1)
}

onMounted(fetchColumns)
</script>

<template>
  <UModal
    :title="`配置列 - ${table.label} (${table.tblName})`"
    size="xl"
    :close="{ onClick: () => emit('close', false) }"
  >
    <div class="p-4">
      <UTable :data="columns" :loading="loading">
        <UTableColumn accessor-key="columnKey" header="列标识">
          <template #cell="{ row }">
            <UInput v-model="row.original.columnKey" placeholder="列标识" />
          </template>
        </UTableColumn>
        <UTableColumn accessor-key="label" header="显示名">
          <template #cell="{ row }">
            <UInput v-model="row.original.label" placeholder="显示名" />
          </template>
        </UTableColumn>
        <UTableColumn accessor-key="order" header="排序">
          <template #cell="{ row }">
            <UInputNumber v-model="row.original.order" :min="0" />
          </template>
        </UTableColumn>
        <UTableColumn accessor-key="width" header="宽度">
          <template #cell="{ row }">
            <UInputNumber v-model="row.original.width" :min="0" />
          </template>
        </UTableColumn>
        <UTableColumn accessor-key="fixed" header="固定">
          <template #cell="{ row }">
            <USelect
              v-model="row.original.fixed"
              :items="[
                { label: '不固定', value: '' },
                { label: '左侧', value: 'left' },
                { label: '右侧', value: 'right' }
              ]"
            />
          </template>
        </UTableColumn>
        <UTableColumn accessor-key="visible" header="显示">
          <template #cell="{ row }">
            <USwitch v-model="row.original.visible" />
          </template>
        </UTableColumn>
        <UTableColumn header="操作">
          <template #cell="{ index }">
            <UButton
              icon="i-lucide-trash-2"
              color="error"
              variant="ghost"
              @click="removeColumn(index)"
            />
          </template>
        </UTableColumn>
      </UTable>
      <UButton
        label="添加列"
        icon="i-lucide-plus"
        class="mt-4"
        @click="addColumn"
      />
    </div>
    <template #footer>
      <UButton
        label="取消"
        color="neutral"
        variant="subtle"
        @click="emit('close', false)"
      />
      <UButton
        label="保存"
        color="primary"
        variant="solid"
        @click="emit('save', columns)"
      />
    </template>
  </UModal>
</template>
