import { computed, ref, h, type Ref, type ComputedRef } from 'vue'
import type { ColumnPinningState } from '@tanstack/table-core'
import type { VColumn } from '../../types/components'
import type { OrderQuery, OrderQueryOpr } from '../../types'
import { ProTableColumnActionHeader, UBadge, UCheckbox, UIcon } from '#components'
import { defu } from 'defu'
import { cloneJson } from '../../utils/string'

interface UseTableColumnsReturn<T> {
  selectionColumn: VColumn<T>
  expandColumn: VColumn<T>
  clonedBizColumns: Ref<VColumn<T>[]>
  columnsWithCommonProps: Ref<VColumn<T>[]>
  sortedColumns: ComputedRef<VColumn<T>[]>
  columnsWithFilterOptions: ComputedRef<VColumn<T>[]>
  columnsWithSortableHeader: ComputedRef<VColumn<T>[]>
  columnsWithTreeifyExpander: ComputedRef<VColumn<T>[]>
  columnPinning: ComputedRef<ColumnPinningState>
}

export function useTableColumns<T>(props: {
  bizColumns: VColumn<T>[]
  commonColumnProps?: any
  localStgSettings: Ref<LocalStorage.TableSettings<T>>
  initStorageColumns: ComputedRef<LocalStorage.Column[]>
  orderQuery: ComputedRef<OrderQuery<T>>
  orderQueryInitValues: ComputedRef<OrderQuery<T>>
  onUpdateOrderQuery: (query: OrderQuery<T>) => void
  onFilterClick: (field: string) => void
  debouncedFetchList: () => void
  fetching: Ref<boolean>
  treeifyColName?: keyof T
  disableRowSelection?: boolean
  expandable?: boolean
}): UseTableColumnsReturn<T> {
  const {
    bizColumns,
    commonColumnProps = { meta: { class: { td: 'min-w-8' } } },
    localStgSettings,
    initStorageColumns,
    orderQuery,
    onUpdateOrderQuery,
    onFilterClick,
    debouncedFetchList,
    fetching,
    treeifyColName,
    disableRowSelection,
    expandable
  } = props

  const selectionColumn: VColumn<T> = {
    id: 'select',
    header: ({ table }) =>
      h(UCheckbox, {
        'modelValue': table.getIsSomePageRowsSelected()
          ? 'indeterminate'
          : table.getIsAllPageRowsSelected(),
        'onUpdate:modelValue': (value: boolean | 'indeterminate') =>
          table.toggleAllPageRowsSelected(!!value),
        'ariaLabel': '选择所有行'
      }),
    cell: ({ row }) =>
      h(UCheckbox, {
        'modelValue': row.getIsSelected() ? true : row.getIsSomeSelected() ? 'indeterminate' : false,
        'onUpdate:modelValue': (value: boolean | 'indeterminate') => row.toggleSelected(!!value),
        'ariaLabel': '选择行'
      }),
    meta: {
      class: {
        th: 'w-12 min-w-12 px-4', // 无数据的时候也有宽度
        td: 'w-12 min-w-12'
      }
    },
    size: 48
  }

  const expandColumn: VColumn<T> = {
    id: 'expand',
    cell: ({ row }) =>
      h('div', { class: 'flex' }, [
        h(UIcon, {
          'name': 'i-lucide-chevron-left',
          'aria-label': 'Expand',
          'role': 'expand-col',
          'class': `${row.getIsExpanded() ? '-rotate-90' : ''} duration-200 cursor-pointer size-4 text-dimmed`,
          'onClick': () => row.toggleExpanded()
        })
      ]),
    meta: {
      class: {
        td: 'w-12 min-w-12'
      }
    },
    size: 48
  }

  const clonedBizColumns = ref<VColumn<T>[]>(bizColumns)

  const columnsWithCommonProps = ref<VColumn<T>[]>(
    clonedBizColumns.value.map(col => defu(col, cloneJson(commonColumnProps)) as VColumn<T>)
  )

  const sortedColumns = computed<VColumn<T>[]>(() => {
    const sortedKeys = (localStgSettings.value.columns ?? initStorageColumns.value)
      .filter(c => c.checked)
      .map(c => c.accessorKey)
    return sortedKeys
      .map(key => columnsWithCommonProps.value.find(col => (col as any)['accessorKey'] === key))
      .filter(Boolean) as VColumn<T>[]
  })

  const columnsWithFilterOptions = computed<VColumn<T>[]>(() => {
    return sortedColumns.value.map((col) => {
      if (!col.filterOption) {
        return col
      }
      switch (col.filterOption.type) {
        case 'select':
          if (col.cell) return col
          return {
            ...col,
            cell: ({ cell }) => {
              const item = (col.filterOption as any)?.['items'].find((item: any) => item.value === cell.getValue())
              return item
                ? h(UBadge, {
                    color: item?.color ?? 'neutral',
                    variant: (col.filterOption as any)?.['variant'] ?? 'outline',
                    icon: item?.icon
                  }, () => item?.label ?? '未知值')
                : ''
            }
          }
        default:
          return col
      }
    }) as VColumn<T>[]
  })

  const columnsWithSortableHeader = computed<VColumn<T>[]>(() => {
    return columnsWithFilterOptions.value.map(col => ({
      ...col,
      header: ({ column }) => {
        const field = (col as any)['accessorKey'] as keyof T
        const orderQueryIndex = orderQuery.value.findIndex(item => item.field === field)
        const orderQueryItem = orderQueryIndex >= 0 ? orderQuery.value[orderQueryIndex] : undefined
        // 多列排序时才显示序号（1-based）
        const orderIndex = orderQuery.value.length > 1 && orderQueryIndex >= 0
          ? orderQueryIndex + 1
          : undefined
        const onUpdateOrderOpr = (nextOrder: OrderQueryOpr) => {
          if (nextOrder !== null) {
            const newQuery = [...orderQuery.value]
            if (orderQueryIndex >= 0) {
              newQuery[orderQueryIndex] = { field, order: nextOrder }
            } else {
              newQuery.push({ field, order: nextOrder })
            }
            onUpdateOrderQuery(newQuery)
          } else {
            const newOrderQuery = [...orderQuery.value]
            newOrderQuery.splice(orderQueryIndex, 1)
            onUpdateOrderQuery(newOrderQuery)
          }
        }
        const accessorKey = (col as any)['accessorKey'] as string
        const onUpdatePinned = (position: 'left' | 'right' | 'unfixed') => {
          const columns = [...(localStgSettings.value.columns ?? initStorageColumns.value)]
          const idx = columns.findIndex(c => c.accessorKey === accessorKey)
          if (idx >= 0) {
            columns[idx] = { ...columns[idx]!, fixed: position }
            localStgSettings.value = { ...localStgSettings.value, columns }
          }
        }
        return h(ProTableColumnActionHeader, {
          label: col.header as string,
          accessorKey,
          fetchList: debouncedFetchList as () => Promise<void>,
          disabled: fetching.value,
          enableOrder: col.sortOption !== undefined,
          isOrdered: Boolean(orderQueryItem),
          orderOpr: orderQueryItem?.order,
          orderIndex,
          onUpdateOrderOpr,
          isPinned: column.getIsPinned(),
          onUpdatePinned,
          enableFilter: col.filterOption !== undefined,
          onFilterClick,
          onHideColumn: (key: string) => {
            const columns = [...(localStgSettings.value.columns ?? initStorageColumns.value)]
            const idx = columns.findIndex(c => c.accessorKey === key)
            if (idx >= 0) {
              columns[idx] = { ...columns[idx]!, checked: false }
              localStgSettings.value = { ...localStgSettings.value, columns }
            }
          }
        })
      }
    } as VColumn<T>))
  })

  const columnsWithTreeifyExpander = computed<VColumn<T>[]>(() => {
    if (!treeifyColName || columnsWithSortableHeader.value.length === 0) return columnsWithSortableHeader.value

    const treeifyCol: VColumn<T> = {
      ...columnsWithSortableHeader.value[0],
      cell: (cellProps) => {
        const originalCellContent = (() => {
          const originalCell = columnsWithSortableHeader.value[0]?.cell
          if (typeof originalCell === 'function') {
            return originalCell(cellProps)
          } else if (originalCell) {
            return originalCell
          }
          return cellProps.getValue()
        })()

        return h(
          'div',
          {
            style: {
              paddingLeft: `${cellProps.row.depth}rem`
            },
            class: 'flex items-center gap-2'
          },
          [
            h(UIcon, {
              name: cellProps.row.getIsExpanded() && cellProps.row.getCanExpand() ? 'i-lucide-chevron-down' : 'i-lucide-chevron-right',
              onClick: cellProps.row.getToggleExpandedHandler(),
              class: `cursor-pointer ${!cellProps.row.getCanExpand() && 'opacity-0'}`
            }),
            originalCellContent
          ]
        )
      }
    } as VColumn<T>

    return [treeifyCol, ...columnsWithSortableHeader.value.slice(1)]
  })

  const columnPinning = computed(() => {
    const leftPinnedKeys: (string | number)[] = []
    if (!disableRowSelection) {
      leftPinnedKeys.push('select')
    }
    if (expandable) {
      leftPinnedKeys.push('expand')
    }

    leftPinnedKeys.push(...(localStgSettings.value.columns
      ?.filter(c => c.fixed === 'left' && c.checked)
      .map(c => c.accessorKey) ?? []))

    const rightPinnedKeys = localStgSettings.value.columns
      ?.filter(c => c.fixed === 'right' && c.checked)
      .map(c => c.accessorKey) ?? []
    rightPinnedKeys.push('actions')

    return {
      left: leftPinnedKeys,
      right: rightPinnedKeys
    }
  })

  return {
    selectionColumn,
    expandColumn,
    clonedBizColumns,
    columnsWithCommonProps,
    sortedColumns,
    columnsWithFilterOptions,
    columnsWithSortableHeader,
    columnsWithTreeifyExpander,
    columnPinning
  }
}
