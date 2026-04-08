<script setup lang="ts">
import type { VFormFieldProps, Table, TableColumn, VColumn } from '#v/types'
import * as z from 'zod'
import { useOverlay } from '@nuxt/ui/composables'
import FormCreateModalTemplate from '#v/components/form/create-modal-template/index.vue'
import ProSimpleTable from '#v/components/simple-table/index.vue'
import TableColumnModal from './TableColumnModal.vue'
import { useFormSubmission, useFormValues, useTableApi, useTableColumnApi } from '#v/composables'
import { computed, ref, toRef, onMounted } from 'vue'

const props = defineProps<{
  model: Table
}>()

const emit = defineEmits<{
  close: [boolean]
  save: [Table]
}>()

const overlay = useOverlay()
const columnModal = overlay.create(TableColumnModal)

const { oldValues, newValues } = useFormValues(toRef(props.model), { id: 0 })

const tableColumnApi = useTableColumnApi()

interface ColumnRow {
  id: number
  columnKey: string
  label: string
  order: number
  width: number
  fixed: 'left' | 'right' | ''
  visible: boolean
  _isDirty?: boolean
}

const columns = ref<ColumnRow[]>([])
const deletedColumnIds = ref<number[]>([])
const loading = ref(false)

async function fetchColumns() {
  if (props.model.id === 0) return
  loading.value = true
  const { data } = await tableColumnApi.list({
    pagination: { pageNum: 0, pageSize: 0 },
    orderQuery: [{ field: 'order', order: 'asc' }],
    whereQuery: {
      items: [{ field: 'tableId', value: props.model.id, opr: 'eq' }]
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

onMounted(fetchColumns)

function addColumn() {
  const maxOrder = columns.value.reduce((max, col) => Math.max(max, col.order ?? 0), 0)
  columns.value.push({
    id: 0,
    columnKey: '',
    label: '',
    order: maxOrder + 1,
    width: 100,
    fixed: '',
    visible: true,
    _isDirty: true
  })
}

function removeColumn(index: number) {
  const col = columns.value[index]
  if (col.id !== 0) {
    deletedColumnIds.value.push(col.id)
  }
  columns.value.splice(index, 1)
}

async function editColumn(index: number) {
  const col = columns.value[index]
  const isNew = col.id === 0
  if (isNew) {
    return
  }
  const result = await columnModal.open({ table: props.model, column: col }).result
  if (result) {
    const updatedCol = result as ColumnRow
    columns.value[index] = { ...updatedCol, _isDirty: true }
  }
}

const tableColumns: VColumn<ColumnRow>[] = [
  {
    accessorKey: 'columnKey',
    header: '列标识',
    size: 120
  },
  {
    accessorKey: 'label',
    header: '显示名',
    size: 120
  },
  {
    accessorKey: 'order',
    header: '顺序',
    size: 80
  },
  {
    accessorKey: 'width',
    header: '宽度',
    size: 80
  },
  {
    accessorKey: 'fixed',
    header: '固定',
    size: 80,
    cell: ({ row }) => {
      const fixedMap: Record<string, string> = { '': '否', left: '左', right: '右' }
      return fixedMap[row.fixed] ?? '否'
    }
  },
  {
    accessorKey: 'visible',
    header: '显示',
    size: 60,
    cell: ({ row }) => row.visible ? '是' : '否'
  },
  {
    accessorKey: 'actions',
    header: '操作',
    size: 100,
    cell: ({ row, index }) => {
      return {
        type: 'div',
        class: 'flex gap-1',
        children: [
          {
            type: 'button',
            label: '编辑',
            icon: 'i-lucide-edit',
            variant: 'ghost',
            size: 'xs',
            onClick: () => editColumn(index)
          },
          {
            type: 'button',
            label: '删除',
            icon: 'i-lucide-trash-2',
            color: 'error',
            variant: 'ghost',
            size: 'xs',
            onClick: () => removeColumn(index)
          }
        ]
      }
    }
  }
]

const { onSubmit } = useFormSubmission(
  toRef(oldValues),
  toRef(newValues),
  close => emit('close', close),
  async (model) => {
    const tableApi = useTableApi()
    if (model.id === 0) {
      const { data } = await tableApi.create(model)
      const newTable = data.value?.data
      if (newTable && columns.value.length > 0) {
        for (const col of columns.value) {
          await tableColumnApi.create({
            ...col,
            tableId: newTable.id
          } as TableColumn)
        }
      }
      emit('save', newTable as Table)
    } else {
      for (const col of columns.value) {
        if (col._isDirty) {
          const colData = {
            id: col.id,
            tableId: props.model.id,
            columnKey: col.columnKey,
            label: col.label,
            order: col.order,
            width: col.width,
            fixed: col.fixed,
            visible: col.visible
          }
          if (col.id === 0) {
            await tableColumnApi.create(tableColumnApi.prune(colData as TableColumn))
          } else {
            await tableColumnApi.update(tableColumnApi.prune(colData as TableColumn))
          }
        }
      }
      for (const id of deletedColumnIds.value) {
        await tableColumnApi.deleteById(id)
      }
      emit('save', model)
    }
  },
  useTableApi
)

const fields = computed<VFormFieldProps[]>(() => [
  { name: 'tblName', type: 'input', label: '表名', colSpan: '12', zodType: z.string().min(1, '表名不能为空') },
  { name: 'label', type: 'input', label: '显示名', colSpan: '12', zodType: z.string().min(1, '显示名不能为空') },
  { name: 'labelI18nKey', type: 'input', label: 'i18n Key', colSpan: '24', zodType: z.string().optional().nullable() }
])

function updateModelValue(newVal: Partial<Table>) {
  newValues.value = { id: 0, ...newVal }
}
</script>

<template>
  <FormCreateModalTemplate
    title="Table"
    :on-close="ok => emit('close', ok)"
    :fields="fields"
    :model-value="newValues"
    @update-model-value="updateModelValue"
    @submit="onSubmit"
  >
    <template #after-form>
      <div class="border-t pt-4 mt-4">
        <div class="flex items-center justify-between mb-2">
          <div>
            <div class="font-semibold">列配置</div>
            <div class="text-sm text-dimmed">配置 Table 的列信息</div>
          </div>
          <UButton
            label="添加列"
            icon="i-lucide-plus"
            variant="soft"
            size="sm"
            @click="addColumn"
          />
        </div>

        <div v-if="loading" class="py-8 text-center text-dimmed">
          加载中...
        </div>
        <div v-else-if="columns.length === 0" class="py-8 text-center text-dimmed">
          暂无列配置，点击"添加列"创建
        </div>
        <ProSimpleTable
          v-else
          :data="columns"
          :biz-columns="tableColumns"
          class="max-h-64 overflow-y-auto"
        />
      </div>
    </template>
  </FormCreateModalTemplate>
</template>
