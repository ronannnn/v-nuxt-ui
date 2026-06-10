<script setup lang="ts" generic="T">
import { useId } from 'vue'
import type { VTableProps } from '#v/types'
import { useProTableView } from '#v/composables/table/useTableView'
import USlideover from '@nuxt/ui/components/Slideover.vue'
import TableHeader from '#v/components/table/header/index.vue'
import TableQueryWhere from '#v/components/table/query/where/index.vue'
import TableQueryOrder from '#v/components/table/query/order/index.vue'
import TablePagination from '#v/components/table/Pagination.vue'
import ScrollArea from '#v/components/ScrollArea.vue'
import LayoutButtonCollapse from '#v/components/layout/button/Collapse.vue'

const props = withDefaults(defineProps<VTableProps<T>>(), {
  singleRow: true,
  singleColumn: false
})
const tablePortalId = `v-table-portal-${useId().replace(/[^A-Za-z0-9_-]/g, '-')}`
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
  <div class="flex-1 flex flex-col overflow-hidden divide-y divide-default">
    <!-- header -->
    <div class="h-(--ui-header-height) flex items-center pl-2.5 pr-2.5 z-3 bg-default">
      <div class="flex items-center gap-1">
        <LayoutButtonCollapse />
        <span class="font-bold">{{ cnName }}</span>
      </div>
      <TableHeader v-bind="tblHeaderProps" class="ml-auto" />
    </div>

    <!-- table -->
    <div :id="tablePortalId" ref="table" class="relative flex-1 flex flex-col h-full overflow-hidden">
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

    <!-- query where (slideover from top, portalled into table) -->
    <USlideover
      :open="tblHeaderProps.whereQueryProps.whereQueryOpen"
      side="top"
      inset
      :close="false"
      :portal="`#${tablePortalId}`"
      :ui="{
        content: '!absolute z-2',
        overlay: 'z-1'
      }"
      @update:open="tblHeaderProps.whereQueryProps.onUpdateWhereQueryOpen"
    >
      <template #content>
        <TableQueryWhere
          ref="proTableQueryWhere"
          v-bind="tblWhereQueryProps"
          :trigger-fetching="async (fromStart: boolean) => {
            await tblWhereQueryProps.triggerFetching(fromStart)
            tblHeaderProps.whereQueryProps.onUpdateWhereQueryOpen?.(false)
          }"
        />
      </template>
    </USlideover>

    <!-- query order (drawer from right) -->
    <USlideover
      :open="tblHeaderProps.orderQueryProps.orderQueryOpen"
      side="top"
      inset
      :portal="`#${tablePortalId}`"
      :ui="{
        content: '!absolute z-2 h-fit w-fit ml-auto',
        overlay: 'z-1'
      }"
      @update:open="tblHeaderProps.orderQueryProps.onUpdateOrderQueryOpen"
    >
      <template #content>
        <TableQueryOrder
          v-bind="tblHeaderProps.orderQueryProps"
          :trigger-fetching="tblHeaderProps.orderQueryProps.triggerFetching"
        />
      </template>
    </USlideover>
  </div>
</template>
