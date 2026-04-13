<script setup lang="ts">
import type { TableColumn } from '#v/types'
import { useOverlay } from '@nuxt/ui/composables'
import TableColumnModal from './TableColumnModal.vue'
import { useTableColumnApi } from '#v/composables'
import { ref, watch } from 'vue'
import ScrollArea from '#v/components/ScrollArea.vue'

const props = defineProps<{
  initialColumns?: TableColumn[]
}>()

const overlay = useOverlay()
const columnModal = overlay.create(TableColumnModal)
const tableColumnApi = useTableColumnApi()

interface ColumnRow extends TableColumn {
  _isDirty?: boolean
}

const columns = ref<ColumnRow[]>([])
const deletedColumnIds = ref<number[]>([])

// 用传入的初始列数据初始化
watch(() => props.initialColumns, (val) => {
  if (val && val.length && columns.value.length === 0) {
    columns.value = val.map(col => ({
      ...col,
      columnKey: col.columnKey ?? '',
      label: col.label ?? '',
      order: col.order ?? 0,
      width: col.width ?? 100,
      fixed: col.fixed ?? '',
      visible: col.visible ?? true
    }))
  }
}, { immediate: true })

function addColumn() {
  const maxOrder = columns.value.reduce((max, col) => Math.max(max, col.order ?? 0), 0)
  const defaultCol: TableColumn = {
    id: 0,
    columnKey: '',
    label: '',
    order: maxOrder + 1,
    width: 100,
    fixed: '',
    visible: true
  }
  columnModal.open({
    column: defaultCol,
    onSaveColumn: (col: TableColumn) => {
      columns.value.push({ ...col, id: 0, _isDirty: true })
    }
  })
}

function removeColumn(index: number) {
  const col = columns.value[index]
  if (!col) return
  if (col.id !== 0) {
    deletedColumnIds.value.push(col.id)
  }
  columns.value.splice(index, 1)
}

function editColumn(index: number) {
  const col = columns.value[index]
  if (!col) return
  columnModal.open({
    column: col,
    onSaveColumn: (updated: TableColumn) => {
      columns.value[index] = { ...updated, id: col.id, _isDirty: true }
    }
  })
}

function fixedLabel(fixed: string) {
  const map: Record<string, string> = { left: '固定左', right: '固定右' }
  return map[fixed] ?? ''
}

/** 供父组件在提交时调用：创建新表后批量创建列 */
async function createAllColumns(tableId: number) {
  for (const col of columns.value) {
    await tableColumnApi.create(tableColumnApi.prune({
      ...col,
      tableId
    } as TableColumn))
  }
}

/** 供父组件在提交时调用：保存已有表的列变更 */
async function saveDirtyColumns(tableId: number) {
  for (const col of columns.value) {
    if (col._isDirty) {
      const colData = {
        id: col.id,
        tableId,
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
}

defineExpose({
  columns,
  createAllColumns,
  saveDirtyColumns
})
</script>

<template>
  <div class="pt-6">
    <div class="flex items-center justify-between mb-3">
      <div>
        <div class="font-semibold text-sm">
          列配置
        </div>
        <div class="text-sm text-dimmed text-xs">
          配置 Table 的列信息
        </div>
      </div>
      <UButton
        label="添加列"
        icon="i-lucide-plus"
        variant="soft"
        size="sm"
        @click="addColumn"
      />
    </div>

    <div v-if="columns.length === 0" class="py-8 text-center text-dimmed text-xs">
      暂无列配置，点击"添加列"创建
    </div>
    <ScrollArea v-else class="max-h-72 rounded-md border border-default">
      <div class="flex flex-col divide-y divide-default">
        <div
          v-for="(col, index) in columns"
          :key="col.id + '-' + index"
          class="group flex items-center gap-3 px-3 py-2.5 transition-colors hover:bg-muted"
        >
          <!-- index box -->
          <div class="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary text-xs font-semibold">
            {{ col.order }}
          </div>

          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2">
              <span class="font-medium text-sm truncate">{{ col.label || '未命名' }}</span>
              <span class="text-xs text-dimmed font-mono truncate">{{ col.columnKey || '-' }}</span>
            </div>
            <div class="flex items-center gap-2 mt-0.5">
              <span class="text-xs text-dimmed">宽 {{ col.width }}px</span>
              <UBadge
                v-if="col.fixed"
                size="xs"
                variant="subtle"
                color="info"
              >
                {{ fixedLabel(col.fixed) }}
              </UBadge>
              <UBadge
                v-if="!col.visible"
                size="xs"
                variant="subtle"
                color="warning"
              >
                已隐藏
              </UBadge>
              <UBadge
                v-if="col.id === 0"
                size="xs"
                variant="subtle"
                color="success"
              >
                新增
              </UBadge>
            </div>
          </div>

          <div class="flex shrink-0 items-center opacity-0 group-hover:opacity-100 transition-opacity">
            <UButton
              icon="i-lucide-pencil"
              variant="ghost"
              size="xs"
              color="neutral"
              @click="editColumn(index)"
            />
            <UButton
              icon="i-lucide-trash-2"
              variant="ghost"
              size="xs"
              color="error"
              @click="removeColumn(index)"
            />
          </div>
        </div>
      </div>
    </ScrollArea>
  </div>
</template>
