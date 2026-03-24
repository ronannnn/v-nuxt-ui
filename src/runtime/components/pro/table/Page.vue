<script setup lang="ts" generic="T">
import type { VTableProps } from '../../../types/components'

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
  <UDashboardPanel :id="name" :ui="{ body: 'p-0!' }">
    <template #header>
      <UDashboardNavbar :title="cnName" class="px-2.5!">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <ProTableHeader v-bind="tblHeaderProps" />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div ref="table" class="flex flex-col h-full">
        <div class="flex flex-col">
          <UCollapsible :open="tblHeaderProps.whereQueryProps.whereQueryOpen">
            <template #content>
              <ProTableQueryWhere ref="proTableQueryWhere" v-bind="tblWhereQueryProps" class="border-b border-default" />
            </template>
          </UCollapsible>
        </div>

        <!-- table -->
        <UContextMenu :items="tblContextMenuItems">
          <ProScrollArea class="flex-1">
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
                  <KeepAlive>
                    <component :is="expandVNode?.(row.original)" :key="row.original[rowKey as keyof T]" role="expand-row" />
                  </KeepAlive>
                </div>
              </template>
            </UTable>
          </ProScrollArea>
        </UContextMenu>

        <!-- pagination -->
        <ProTablePagination v-bind="tblPaginationProps" />
      </div>
    </template>
  </UDashboardPanel>
</template>
