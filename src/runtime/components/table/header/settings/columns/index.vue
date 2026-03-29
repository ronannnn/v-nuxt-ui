<script setup lang="ts" generic="T">
import type { VColumn } from '../../../../../types'
import { ref, computed, onMounted } from 'vue'
import { useLocalStorage } from '@vueuse/core'

export type FixType = 'left' | 'right' | 'unfixed'

const props = defineProps<{
  tblName: string
  rawBizColumns: VColumn<T>[]
  onUpdateBizColumns: (cols: VColumn<T>[]) => void
}>()

const localTblSettings = useLocalStorage<LocalStorage.TableSettings<T>>(`${props.tblName}-table-settings`, {})

// 1. 生成所有列的完整信息（顺序、固定、显示状态）
function getFullColumns(
  stgCols: LocalStorage.Column[] | undefined
): LocalStorage.Column[] {
  const bizKeys = props.rawBizColumns.map(col => (col as any)['accessorKey'])
  const stgColsFiltered = (stgCols ?? []).filter(s => bizKeys.includes(s.accessorKey))
  const stgKeys = stgColsFiltered.map(s => s.accessorKey)
  // 先按 stgCols 顺序
  const result: LocalStorage.Column[] = stgColsFiltered.map((col) => {
    return {
      accessorKey: col.accessorKey,
      fixed: col.fixed ?? 'unfixed',
      checked: col.checked ?? true
    }
  })
  // 再把 rawBizColumns 新增的列加到 unfixed 最后
  props.rawBizColumns.forEach((col) => {
    const key = (col as any)['accessorKey']
    if (!stgKeys.includes(key)) {
      result.push({
        accessorKey: key,
        fixed: 'unfixed',
        checked: true
      })
    }
  })
  return result
}

// 2. 三个 list 的响应式数据
const allColumns = ref<LocalStorage.Column[]>(getFullColumns(localTblSettings.value.columns))
const leftFixedList = computed({
  get: () => allColumns.value.filter(c => c.fixed === 'left'),
  set: list => updateAllColumns(list, 'left')
})
const rightFixedList = computed({
  get: () => allColumns.value.filter(c => c.fixed === 'right'),
  set: list => updateAllColumns(list, 'right')
})
const unfixedList = computed({
  get: () => allColumns.value.filter(c => c.fixed === 'unfixed'),
  set: list => updateAllColumns(list, 'unfixed')
})

// 3. 更新 allColumns 顺序和 fixed
function updateAllColumns(list: LocalStorage.Column[], type: FixType) {
  // 1. 先把所有 columns 里在 list 里的 key 都去掉（全局去重）
  const newKeys = new Set(list.map(c => c.accessorKey))
  // 2. 其他 fixed 类型的列
  const others = allColumns.value.filter(c => c.fixed !== type && !newKeys.has(c.accessorKey))
  // 3. 新 list 的 fixed 设为 type
  const newList = list.map(col => ({ ...col, fixed: type }))
  // 4. 合并，顺序为 left + unfixed + right
  allColumns.value = [
    ...type === 'left' ? newList : [],
    ...type === 'unfixed' ? newList : [],
    ...type === 'right' ? newList : [],
    ...others
  ]
  syncToParentAndStorage()
}

// 4. 切换固定状态
function fixCol(stgCol: LocalStorage.Column, toType: FixType) {
  const idx = allColumns.value.findIndex(c => c.accessorKey === stgCol.accessorKey)
  if (idx !== -1) {
    allColumns.value[idx]!.fixed = toType
    // 保持顺序不变
    syncToParentAndStorage()
  }
}

// 5. 切换显示/隐藏
function toggleChecked(stgCol: LocalStorage.Column) {
  const idx = allColumns.value.findIndex(c => c.accessorKey === stgCol.accessorKey)
  if (idx !== -1) {
    allColumns.value[idx]!.checked = !allColumns.value[idx]!.checked
    syncToParentAndStorage()
  }
}

// 6. 重置
function resetColumns() {
  allColumns.value = getFullColumns(props.rawBizColumns.map(col => ({
    accessorKey: (col as any)['accessorKey'],
    fixed: 'unfixed',
    checked: !col.initHide
  })))
  syncToParentAndStorage()
}

// 7. 同步到父组件和 localStorage
function syncToParentAndStorage() {
  // 排序：left + unfixed + right
  const ordered = [
    ...allColumns.value.filter(c => c.fixed === 'left'),
    ...allColumns.value.filter(c => c.fixed === 'unfixed'),
    ...allColumns.value.filter(c => c.fixed === 'right')
  ]
  localTblSettings.value = { ...localTblSettings.value, columns: ordered }
  // 按 ordered 顺序输出 checked 的 bizColumns
  const checkedKeys = ordered.filter(c => c.checked).map(c => c.accessorKey)
  const sortedBizColumns = checkedKeys
    .map(key => props.rawBizColumns.find(col => (col as any)['accessorKey'] === key))
    .filter(Boolean) as VColumn<T>[]
  props.onUpdateBizColumns(sortedBizColumns)
}

// 8. 初始化
onMounted(() => {
  syncToParentAndStorage()
})

const dragOption = ref({
  group: 'colSettings',
  handle: '.col-settings-handle',
  rawBizColumns: props.rawBizColumns as any,
  onFixCol: fixCol,
  onToggleChecked: toggleChecked
})
</script>

<template>
  <div class="flex flex-col p-2 gap-2">
    <div class="flex items-center">
      <span class="font-bold text-lg">{{ $t('button.columnSetting') }}</span>
      <UButton
        size="sm"
        color="neutral"
        variant="outline"
        class="ml-auto"
        icon="i-lucide-timer-reset"
        @click="() => {
          resetColumns()
        }"
      >
        重置列
      </UButton>
    </div>
    <div class="grid grid-cols-1 justify-center gap-6">
      <!-- 如果不加key的话，可能会导致渲染问题，列表中如果只有最后一个元素，被拖拽掉后，还会存在，即使按了reset按钮 -->
      <ProTableHeaderSettingsColumnsDndList
        v-bind="dragOption"
        :key="leftFixedList.length"
        v-model:list="leftFixedList"
        name="固定在左侧"
      />
      <ProTableHeaderSettingsColumnsDndList
        v-bind="dragOption"
        :key="unfixedList.length"
        v-model:list="unfixedList"
        name="未固定"
      />
      <ProTableHeaderSettingsColumnsDndList
        v-bind="dragOption"
        :key="rightFixedList.length"
        v-model:list="rightFixedList"
        name="固定在右侧"
      />
    </div>
  </div>
</template>
