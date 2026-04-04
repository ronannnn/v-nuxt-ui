<script setup lang="ts" generic="T extends Record<string, any>">
import type { VTableProps } from '#v/types'
import { useProTableView } from '#v/composables/table/useTableView'
import TableHeader from '#v/components/table/header/index.vue'
import TableQueryWhere from '#v/components/table/query/where/index.vue'
import TablePagination from '#v/components/table/Pagination.vue'
import ScrollArea from '#v/components/ScrollArea.vue'
import LayoutButtonCollapse from '#v/components/layout/button/Collapse.vue'

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
  <div class="flex-1 flex flex-col overflow-hidden">
    <!-- header -->
    <div class="h-(--ui-header-height) flex items-center pl-2.5 pr-2.5 border-b border-default">
      <div class="flex items-center gap-1">
        <LayoutButtonCollapse />
        <span class="font-bold">{{ cnName }}</span>
      </div>
      <TableHeader v-bind="tblHeaderProps" class="ml-auto" />
    </div>

    <!-- query where -->
    <UCollapsible :open="tblHeaderProps.whereQueryProps.whereQueryOpen">
      <template #content>
        <TableQueryWhere ref="proTableQueryWhere" v-bind="tblWhereQueryProps" class="bg-muted border-b border-default" />
      </template>
    </UCollapsible>

    <!-- table -->
    <div ref="table" class="flex-1 flex flex-col h-full overflow-hidden border-b border-default">
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
                class="px-1 py-3 sticky inset-4"
                :style="{
                  width: `${tableWidth - 38}px`
                }"
              >
                <KeepAlive>
                  <component :is="expandVNode?.(row.original)" :key="row.original[rowKey as keyof T]" role="expand-row" />
                </KeepAlive>
              </div>
            </template>
          </UTable>
        </ScrollArea>
      </UContextMenu>
    </div>

    <!-- pagination -->
    <TablePagination v-bind="tblPaginationProps" />
  </div>
</template>
