import { computed, shallowRef, h, type Ref, type ShallowRef, type ComputedRef } from 'vue'
import type { ColumnPinningState } from '@tanstack/table-core'
import type { VColumn, OrderQuery, OrderQueryOpr, TableSettings, Column, SelectOption, WhereQueryColumnOption } from '#v/types'
import TableColumnActionHeader from '#v/components/table/column/ActionHeader.vue'
import UBadge from '@nuxt/ui/components/Badge.vue'
import UCheckbox from '@nuxt/ui/components/Checkbox.vue'
import UIcon from '@nuxt/ui/components/Icon.vue'
import { defu } from 'defu'
import { cloneJson } from '#v/utils'

interface UseTableColumnsReturn<T> {
  selectionColumn: VColumn<T>
  expandColumn: VColumn<T>
  clonedBizColumns: ShallowRef<VColumn<T>[]>
  columnsWithCommonProps: ShallowRef<VColumn<T>[]>
  sortedColumns: ComputedRef<VColumn<T>[]>
  columnsWithFilterOptions: ComputedRef<VColumn<T>[]>
  columnsWithSortableHeader: ComputedRef<VColumn<T>[]>
  columnsWithTreeifyExpander: ComputedRef<VColumn<T>[]>
  columnPinning: ComputedRef<ColumnPinningState>
}

export function useTableColumns<T>(props: {
  bizColumns: VColumn<T>[]
  commonColumnProps?: any
  localStgSettings: Ref<TableSettings<T>>
  initStorageColumns: ComputedRef<Column[]>
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
        'onUpdate:modelValue': (value: unknown) =>
          table.toggleAllPageRowsSelected(Boolean(value)),
        'ariaLabel': '选择所有行'
      }),
    cell: ({ row }) =>
      h(UCheckbox, {
        'modelValue': row.getIsSelected() ? true : row.getIsSomeSelected() ? 'indeterminate' : false,
        'onUpdate:modelValue': (value: unknown) => row.toggleSelected(Boolean(value)),
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

  const clonedBizColumns = shallowRef<VColumn<T>[]>(bizColumns)

  // defu<VColumn<T>, ...> 会触发 "Type instantiation is excessively deep"，
  // 因为 VColumn<T> 包含 TanStack 的深层嵌套泛型类型。
  // 使用显式返回类型标注来避免 TypeScript 的深层类型推断。
  const mergeColumnWithDefaults = (col: VColumn<T>, defaults: Record<string, unknown>): VColumn<T> => {
    return defu(col, defaults) as VColumn<T>
  }

  const columnsWithCommonProps = shallowRef<VColumn<T>[]>(
    clonedBizColumns.value.map(col => mergeColumnWithDefaults(col, cloneJson(commonColumnProps)))
  )

  const sortedColumns = computed<VColumn<T>[]>(() => {
    const sortedKeys = (localStgSettings.value.columns ?? initStorageColumns.value)
      .filter(c => c.checked)
      .map(c => c.accessorKey)
    const cols = columnsWithCommonProps.value
    return sortedKeys
      .map(key => cols.find(col => ('accessorKey' in col) && col.accessorKey === key))
      .filter((col): col is VColumn<T> => col !== undefined)
  })

  const columnsWithFilterOptions = computed<VColumn<T>[]>(() => {
    return sortedColumns.value.map((col) => {
      if (!col.filterOption) {
        return col
      }
      switch (col.filterOption.type) {
        case 'select': {
          if (col.cell) return col
          const selectOption = col.filterOption as Extract<WhereQueryColumnOption<T>, { type: 'select' }>
          return {
            ...col,
            cell: ({ cell }) => {
              const item = selectOption.items.find((item: SelectOption) => item.value === cell.getValue())
              return item
                ? h(UBadge, {
                    color: item?.color ?? 'neutral',
                    variant: selectOption.variant ?? 'outline',
                    icon: item?.icon
                  }, () => item?.label ?? '未知值')
                : h(UBadge, { ...selectOption.empty })
            }
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
        const field = 'accessorKey' in col ? (col.accessorKey as string) : ''
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
        const accessorKey = 'accessorKey' in col ? (col.accessorKey as string) : ''
        const onUpdatePinned = (position: 'left' | 'right' | 'unfixed') => {
          const columns = [...(localStgSettings.value.columns ?? initStorageColumns.value)]
          const idx = columns.findIndex(c => c.accessorKey === accessorKey)
          if (idx >= 0) {
            columns[idx] = { ...columns[idx]!, fixed: position }
            localStgSettings.value = { ...localStgSettings.value, columns }
          }
        }
        return h(TableColumnActionHeader, {
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
    const leftPinnedKeys: string[] = []
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
