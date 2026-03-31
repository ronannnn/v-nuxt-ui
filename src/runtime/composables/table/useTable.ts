import { computed, ref, useTemplateRef, nextTick } from 'vue'
import type { ComputedRef, Ref } from 'vue'
import type { OrderQueryProps, TableHeaderProps, TablePaginationProps, VColumn, VTableProps, WhereQueryProps, OrderQuery, StatsItem } from '#v/types'
import type { ContextMenuItem, TableProps, TableRow } from '@nuxt/ui'
import { useTableQuery } from './useTableQuery'
import { useTablePagination } from './useTablePagination'
import { useTableData } from './useTableData'
import { useTableRowSelection } from './useTableRowSelection'
import { useTableColumns } from './useTableColumns'
import { useTableRowActions } from './useTableRowActions'
import { useTableOpr } from './useTableOpr'

export interface UseTableReturn<T> {
  data: Ref<T[]>
  createRow: (row: T) => void
  updateRow: (row: T) => void
  deleteRow: (row: T) => void
  stats: Ref<StatsItem[][]>
  rowSelection: Ref<Record<number, boolean> | undefined>
  onUpdateRowSelection: (newRowSelection: Record<number, boolean> | undefined) => void
  selectedIds: Ref<number[]>
  fetching: Ref<boolean>
  fetchList: () => Promise<void>
  debouncedFetchList: () => void
  whereQueryOpen: boolean
  onUpdateWhereQueryOpen: (open: boolean) => void
  columns: ComputedRef<VColumn<T>[]>
  tblProps: ComputedRef<TableProps<T>>
  tblWhereQueryProps: ComputedRef<WhereQueryProps<T>>
  tblHeaderProps: ComputedRef<TableHeaderProps<T>>
  tblPaginationProps: ComputedRef<TablePaginationProps<T>>
  tblContextMenuItems: Ref<ContextMenuItem[]>
}

export function useTable<T>(props: VTableProps<T>): UseTableReturn<T> {
  const {
    // table-level props
    name,
    disableCreation,
    disableRefresh,
    disableBatchDeletion,
    disableSettings,
    disableFetchOnMounted,
    useApiGroup,
    apiListFn,
    fetchAll,
    onEditRowFromModal,
    exportExcel,

    // header-level props
    extraButtons,
    onNew,

    // where query
    disableWhereQuery,
    extraWhereQueryOptions,
    extraWhereQueryInitValues,

    // order query
    disableOrderQuery,
    extraOrderQueryOptions,

    // column-level props
    bizColumns,
    extraRowActions,
    treeifyColName,
    commonColumnProps,

    // row-level props
    rowKey = 'id' as keyof T,
    disableRowActions,
    disableRowUpdate,
    disableRowCopy,
    disableRowDeletion,
    disableRowSelection,
    expandable,
    rowSpanColumns,
    customRowCopyFn
  } = props

  // Query (where & order)
  const queryComposable = useTableQuery({
    name,
    bizColumns,
    extraWhereQueryOptions,
    extraWhereQueryInitValues,
    extraOrderQueryOptions
  })

  const {
    whereQueryOptions,
    whereQueryInitValues,
    orderQueryOptions,
    orderQueryInitValues,
    initStorageColumns,
    localStgSettings,
    whereQuery,
    whereQueryOpen,
    orderQuery,
    isWhereQueryValueEmpty,
    pruneWhereQuery
  } = queryComposable

  // Pagination
  const paginationComposable = useTablePagination(localStgSettings)
  const { pagination, pageSizeDropdownMenuItems } = paginationComposable

  // Data & CRUD
  const dataComposable = useTableData({
    name,
    rowKey,
    apiListFn,
    useApiGroup,
    fetchAll,
    treeifyColName,
    disableFetchOnMounted,
    pagination,
    pruneWhereQuery,
    whereQuery,
    orderQuery,
    clearRowSelection: () => rowSelectionComposable.clearRowSelection()
  })

  const {
    data,
    treeifyData,
    stats,
    total,
    createRow,
    updateRow,
    deleteRow,
    fetching,
    fetchList,
    debouncedFetchList
  } = dataComposable

  // Row Selection
  const rowSelectionComposable = useTableRowSelection(data, rowKey)
  const { rowSelection, selectedIds, clearRowSelection: _clearRowSelection } = rowSelectionComposable

  // Filter focus (triggered from column header dropdown)
  const whereQueryRef = useTemplateRef<{ focusField: (field: string) => void }>('proTableQueryWhere')
  const onFilterClick = (field: string) => {
    // 1. Open where query panel
    whereQueryOpen.value = true
    // 2. Add filter item if not present
    const currentItems = whereQuery.value?.items ?? []
    const existingItem = currentItems.find(item => item.field === field)
    if (!existingItem) {
      const col = bizColumns.find(c => (c as any)['accessorKey'] === field)
      if (col?.filterOption) {
        whereQuery.value = {
          ...whereQuery.value,
          items: [...currentItems, {
            field,
            opr: col.filterOption.defaultOpr ?? useTableOpr().getDefaultOprByType(col.filterOption.type),
            value: null,
            custom: col.filterOption.custom
          }]
        }
      }
    }
    // 3. Focus the field (retry until component is mounted after UCollapsible opens)
    const tryFocus = (retries: number) => {
      nextTick(() => {
        const focused = whereQueryRef.value?.focusField(field)
        if (!focused && retries > 0) {
          setTimeout(() => tryFocus(retries - 1), 50)
        }
      })
    }
    tryFocus(3)
  }

  // Columns
  const columnsComposable = useTableColumns({
    bizColumns,
    commonColumnProps,
    localStgSettings,
    initStorageColumns,
    orderQuery,
    orderQueryInitValues,
    onUpdateOrderQuery: (query: OrderQuery<T>) => orderQuery.value = query,
    onFilterClick,
    debouncedFetchList,
    fetching,
    treeifyColName,
    disableRowSelection,
    expandable
  })

  const {
    selectionColumn,
    expandColumn,
    clonedBizColumns,
    columnsWithTreeifyExpander,
    columnPinning
  } = columnsComposable

  // Row Actions
  const rowActionsComposable = useTableRowActions({
    rowKey,
    disableRowActions,
    disableRowUpdate,
    disableRowCopy,
    disableRowDeletion,
    onEditRowFromModal,
    extraRowActions,
    useApiGroup,
    customRowCopyFn,
    fetchList
  })

  const { getRowActions, generateActionColumn } = rowActionsComposable

  // Generate final columns with all processing
  const columns = computed<VColumn<T>[]>(() => {
    const newCols: VColumn<T>[] = []

    if (!disableRowSelection) {
      newCols.push(selectionColumn)
    }
    if (expandable) {
      newCols.push(expandColumn)
    }
    newCols.push(...columnsWithTreeifyExpander.value)

    // rowSpanColumns 处理
    if (rowSpanColumns && rowSpanColumns.length > 0 && data.value.length > 0) {
      const rowSpanIdxObj: Partial<Record<(keyof T), number[]>> = {}

      rowSpanColumns.forEach((colName, colIdx) => {
        let prevValue: any = undefined
        let prevStartIdx = 0
        let prevSpan = 1
        let prevMaxRowSpan = 1

        for (let rowIdx = 0; rowIdx < data.value.length; rowIdx++) {
          const row = data.value[rowIdx]!
          const value = row[colName]

          if (colIdx === 0) {
            if (rowIdx === 0 || value !== prevValue) {
              prevValue = value
              prevStartIdx = rowIdx
              prevSpan = 1
            } else {
              prevSpan++
            }
            if (!rowSpanIdxObj[colName]) rowSpanIdxObj[colName] = []
            rowSpanIdxObj[colName][prevStartIdx] = prevSpan
            if (rowIdx > prevStartIdx) rowSpanIdxObj[colName][rowIdx] = 0
          } else {
            const prevColName = rowSpanColumns[colIdx - 1]!
            let groupStart = rowIdx
            while (groupStart >= 0 && row[prevColName] === data.value[groupStart]![prevColName]) {
              groupStart--
            }
            groupStart++

            let maxRowspan = 0
            for (let i = groupStart; i <= rowIdx; i++) {
              maxRowspan = Math.max(maxRowspan, rowSpanIdxObj[prevColName]![i] ?? 1)
            }

            if (rowIdx === 0 || value !== prevValue || prevSpan >= prevMaxRowSpan) {
              prevValue = value
              prevStartIdx = rowIdx
              prevSpan = 1
              prevMaxRowSpan = maxRowspan
            } else {
              prevSpan++
            }
            if (!rowSpanIdxObj[colName]) rowSpanIdxObj[colName] = []
            rowSpanIdxObj[colName][prevStartIdx] = Math.min(prevSpan, maxRowspan)
            if (rowIdx > prevStartIdx) rowSpanIdxObj[colName][rowIdx] = 0
          }
        }
      })

      newCols.forEach((col) => {
        if (rowSpanColumns.includes((col as any)['accessorKey'])) {
          col.meta = col.meta || {}
          col.meta.class = col.meta.class || {}
          col.meta.rowspan = col.meta.rowspan || {}
          col.meta.class.td = (cell) => {
            const rowIdx = cell.row.index
            const rowspan = rowSpanIdxObj[(col as any)['accessorKey'] as keyof T]?.[rowIdx] ?? 1
            return rowspan === 0 ? 'hidden' : ''
          }
          col.meta.rowspan.td = (cell) => {
            const rowIdx = cell.row.index
            const rowspan = rowSpanIdxObj[(col as any)['accessorKey'] as keyof T]?.[rowIdx] ?? 1
            return rowspan === 0 ? '' : rowspan.toString()
          }
        }
      })
    }

    if (!disableRowActions) {
      newCols.push(generateActionColumn())
    }

    return newCols
  })

  // Context menu
  const tblContextMenuItems = ref<ContextMenuItem[]>([])
  function onContextmenu(_e: Event, row: TableRow<T>) {
    tblContextMenuItems.value = getRowActions(row)
  }

  // Table props composition
  const tblProps = computed<TableProps<T>>(() => ({
    data: treeifyColName ? treeifyData.value : data.value,
    columns: columns.value,
    loading: fetching.value,
    sticky: true,
    getSubRows: row => (row as any)['children'],
    expanded: treeifyColName ? true : undefined,
    columnPinning: columnPinning.value,
    onContextmenu: onContextmenu
  }))

  const tblWhereQueryProps = computed<WhereQueryProps<T>>(() => ({
    whereOptions: whereQueryOptions.value,
    defaultWhereQuery: whereQueryInitValues.value,
    whereQuery: whereQuery.value,
    onUpdateWhereQuery: query => whereQuery.value = query,
    whereQueryOpen: whereQueryOpen.value,
    onUpdateWhereQueryOpen: (open: boolean) => whereQueryOpen.value = open,
    isWhereQueryValueEmpty: isWhereQueryValueEmpty.value,
    fetching: fetching.value,
    triggerFetching: fetchList,
    bizColumns: bizColumns
  }))

  const tblOrderQueryProps = computed<OrderQueryProps<T>>(() => ({
    orderOptions: orderQueryOptions.value,
    defaultOrderQuery: orderQueryInitValues.value,
    orderQuery: orderQuery.value,
    onUpdateOrderQuery: query => orderQuery.value = query,
    fetching: fetching.value,
    triggerFetching: debouncedFetchList,
    bizColumns: bizColumns
  }))

  const tblHeaderProps = computed<TableHeaderProps<T>>(() => ({
    name,
    fetching: fetching.value,
    rawBizColumns: bizColumns,
    onUpdateBizColumns: (columns: VColumn<T>[]) => {
      clonedBizColumns.value = columns
    },
    initStorageColumns: initStorageColumns.value,
    onNew,
    apiGroup: useApiGroup,
    fetchList,
    onEditRowFromModal,
    selectedIds: selectedIds.value,
    disableCreation,
    disableWhereQuery,
    whereQueryProps: tblWhereQueryProps.value,
    disableOrderQuery,
    orderQueryProps: tblOrderQueryProps.value,
    disableBatchDeletion,
    disableRefresh,
    disableSettings,
    exportExcel,
    extraWhereQueryInitValues: extraWhereQueryInitValues,
    extraButtons
  }))

  const tblPaginationProps = computed<TablePaginationProps<T>>(() => ({
    data: data.value,
    selectedIds: selectedIds.value,
    pageNum: pagination.value.pageNum ?? 1,
    pageSize: pagination.value.pageSize ?? 10,
    total: total.value ?? 0,
    onUpdatePage: (pageNum: number) => pagination.value.pageNum = pageNum,
    hidePagination: fetchAll,
    fetching: fetching.value,
    pageSizeDropdownMenuItems: pageSizeDropdownMenuItems.value
  }))

  return {
    // data
    data,
    createRow,
    updateRow,
    deleteRow,
    stats,
    // row selection
    rowSelection,
    onUpdateRowSelection: (newRowSelection: Record<number, boolean> | undefined) => rowSelection.value = newRowSelection,
    selectedIds,
    // crud
    fetching,
    fetchList,
    debouncedFetchList,
    // where query
    whereQueryOpen: whereQueryOpen.value,
    onUpdateWhereQueryOpen: (open: boolean) => whereQueryOpen.value = open,
    // columns
    columns,
    // props
    tblProps,
    tblWhereQueryProps,
    tblHeaderProps,
    tblPaginationProps,
    // others
    tblContextMenuItems
  } as UseTableReturn<T>
}
