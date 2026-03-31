<script setup lang="ts" generic="T">
import type { VTableProps } from '#v/types'
import { useProTableView } from '#v/composables/table/useTableView'
import TableHeader from '#v/components/table/header/index.vue'
import TableQueryWhere from '#v/components/table/query/where/index.vue'
import TablePagination from '#v/components/table/Pagination.vue'
import ScrollArea from '#v/components/ScrollArea.vue'

const props = withDefaults(defineProps<VTableProps<T>>(), {
  singleRow: true,
  singleColumn: false
})
const {
  // data
  data,
  createRow,
  updateRow,
  deleteRow,
  stats,
  // crud
  fetchList,
  // row selection
  rowSelection,
  onUpdateRowSelection,
  // props
  tblProps,
  tblWhereQueryProps,
  tblHeaderProps,
  tblPaginationProps,
  // others
  tblContextMenuItems,
  // view
  tableWidth,
  updateTableWidth,
  tblClasses,
  tblUi
} = useProTableView<T>(props)

// expose
defineExpose({ createRow, updateRow, deleteRow, refresh: fetchList, stats, data })
</script>

<template>
  <div ref="table" class="flex flex-col h-full">
    <!-- header -->
    <div class="flex flex-col">
      <div class="flex items-center gap-1 py-2 px-3 h-(--ui-header-height) border-b border-default">
        <div class="font-semibold text-highlighted truncate">
          {{ cnName }}
        </div>
        <TableHeader v-bind="tblHeaderProps" class="ml-auto" />
      </div>
      <UCollapsible :open="tblHeaderProps.whereQueryProps.whereQueryOpen">
        <template #content>
          <TableQueryWhere ref="proTableQueryWhere" v-bind="tblWhereQueryProps" class="border-b border-default" />
        </template>
      </UCollapsible>
    </div>

    <!-- table -->
    <UContextMenu :items="tblContextMenuItems">
      <ScrollArea class="flex-1">
        <UTable
          v-bind="tblProps"
          :row-selection="rowSelection"
          :class="tblClasses"
          :ui="tblUi"
          @resize="updateTableWidth"
          @update:row-selection="onUpdateRowSelection"
        >
          <template v-if="expandable" #expanded="{ row }">
            <div
              class="px-1 py-3 sticky inset-4 overflow-hidden"
              :style="{
                width: `${tableWidth - 38}px`
              }"
            >
              <component :is="() => expandVNode?.(row.original)" role="expand-row" />
            </div>
          </template>
        </UTable>
      </ScrollArea>
    </UContextMenu>

    <!-- pagination -->
    <TablePagination v-bind="tblPaginationProps" />
  </div>
</template>
