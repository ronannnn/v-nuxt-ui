<script setup lang="ts">
import type { TableColumn, Table } from '#v/types'
import { useTableColumnApi } from '#v/composables/api'
import { ref, onMounted } from 'vue'
import { useToast } from '@nuxt/ui/composables'

const props = defineProps<{
  table: Table
}>()

const emit = defineEmits<{
  close: [boolean]
  save: [TableColumn[]]
}>()

const tableColumnApi = useTableColumnApi()
const loading = ref(false)
const saving = ref(false)

interface ColumnRow {
  id: number
  columnKey: string
  label: string
  order: number
  width: number
  fixed: string
  visible: boolean
}

const columns = ref<ColumnRow[]>([])
const deletedColumnIds = ref<number[]>([])

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
    columns.value = data.value.data.list.map(col => ({
      id: col.id,
      columnKey: col.columnKey,
      label: col.label,
      order: col.order,
      width: col.width,
      fixed: col.fixed,
      visible: col.visible
    }))
  }
  loading.value = false
}

function addColumn() {
  const maxOrder = columns.value.reduce((max, col) => Math.max(max, col.order ?? 0), 0)
  columns.value.push({
    id: 0,
    columnKey: '',
    label: '',
    order: maxOrder + 1,
    width: 100,
    fixed: '',
    visible: true
  })
}

function removeColumn(index: number) {
  const col = columns.value[index]
  if (col.id !== 0) {
    deletedColumnIds.value.push(col.id)
  }
  columns.value.splice(index, 1)
}

async function handleSave() {
  saving.value = true
  try {
    for (const col of columns.value) {
      const data = {
        id: col.id,
        tableId: props.table.id,
        columnKey: col.columnKey,
        label: col.label,
        order: col.order,
        width: col.width,
        fixed: col.fixed as '' | 'left' | 'right',
        visible: col.visible
      }
      if (col.id === 0) {
        await tableColumnApi.create(tableColumnApi.prune(data as TableColumn))
      } else {
        await tableColumnApi.update(tableColumnApi.prune(data as TableColumn))
      }
    }
    for (const id of deletedColumnIds.value) {
      await tableColumnApi.deleteById(id)
    }
    useToast().add({
      title: '保存成功',
      description: `列配置已保存`,
      color: 'success',
      icon: 'i-lucide-check-circle'
    })
    emit('save', columns.value as TableColumn[])
    emit('close', true)
  } catch (error) {
    useToast().add({
      title: '保存失败',
      description: String(error),
      color: 'error',
      icon: 'i-lucide-x-circle'
    })
    emit('close', false)
  } finally {
    saving.value = false
  }
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
      <div class="flex flex-col gap-2">
        <div class="grid grid-cols-7 gap-2 text-sm font-medium text-dimmed px-2">
          <div>列标识</div>
          <div>显示名</div>
          <div>顺序</div>
          <div>宽度</div>
          <div>固定</div>
          <div>显示</div>
          <div></div>
        </div>
        
        <div
          v-for="(col, idx) in columns"
          :key="idx"
          class="grid grid-cols-7 gap-2 items-center"
        >
          <UInput
            v-model="col.columnKey"
            placeholder="列标识"
          />
          <UInput
            v-model="col.label"
            placeholder="显示名"
          />
          <UInputNumber
            v-model="col.order"
            :min="0"
          />
          <UInputNumber
            v-model="col.width"
            :min="0"
          />
          <USelect
            v-model="col.fixed"
            :items="[
              { label: '不固定', value: '' },
              { label: '左侧', value: 'left' },
              { label: '右侧', value: 'right' }
            ]"
          />
          <USwitch v-model="col.visible" />
          <UButton
            icon="i-lucide-trash-2"
            color="error"
            variant="ghost"
            @click="removeColumn(idx)"
          />
        </div>
      </div>
      
      <UButton
        label="添加列"
        icon="i-lucide-plus"
        variant="soft"
        class="mt-2"
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
        :loading="saving"
        @click="handleSave"
      />
    </template>
  </UModal>
</template>
