import { ref, computed, watch, onMounted, onUnmounted, nextTick, useTemplateRef } from 'vue'
import type { Ref, ComputedRef } from 'vue'
import type { VTableProps, TableHeaderProps, TablePaginationProps, WhereQueryProps, StatsItem } from '#v/types'
import type { TableProps, ContextMenuItem } from '@nuxt/ui'
import type { ColumnSizingState } from '@tanstack/table-core'
import { useTable } from './useTable'

type TablePropsWithColumnState<T> = TableProps<T> & {
  columnPinning?: unknown
  columnSizing?: ColumnSizingState
}

// 固定列阴影样式常量
// light 模式使用 rgba(0,0,0,0.15)，dark 模式使用更明显的 rgba(0,0,0,0.45)
// 通过 CSS 变量 --pinned-shadow-color 统一控制，配合 dark: 变体覆盖
const PINNED_SHADOW_CLASSES = {
  left: {
    base: '[--pinned-shadow-color:rgba(0,0,0,0.15)] dark:[--pinned-shadow-color:rgba(0,0,0,0.45)] [&_th[data-pinned=left]:not(:has(+th[data-pinned=left]))]:after:absolute [&_th[data-pinned=left]:not(:has(+th[data-pinned=left]))]:after:top-0 [&_th[data-pinned=left]:not(:has(+th[data-pinned=left]))]:after:right-0 [&_th[data-pinned=left]:not(:has(+th[data-pinned=left]))]:after:bottom-0 [&_th[data-pinned=left]:not(:has(+th[data-pinned=left]))]:after:w-[30px] [&_th[data-pinned=left]:not(:has(+th[data-pinned=left]))]:after:translate-x-full [&_th[data-pinned=left]:not(:has(+th[data-pinned=left]))]:after:transition-opacity [&_th[data-pinned=left]:not(:has(+th[data-pinned=left]))]:after:duration-300 [&_th[data-pinned=left]:not(:has(+th[data-pinned=left]))]:after:pointer-events-none [&_th[data-pinned=left]:not(:has(+th[data-pinned=left]))]:after:shadow-[inset_10px_0_8px_-8px_var(--pinned-shadow-color)] [&_td[data-pinned=left]:not(:has(+td[data-pinned=left]))]:after:absolute [&_td[data-pinned=left]:not(:has(+td[data-pinned=left]))]:after:top-0 [&_td[data-pinned=left]:not(:has(+td[data-pinned=left]))]:after:right-0 [&_td[data-pinned=left]:not(:has(+td[data-pinned=left]))]:after:bottom-0 [&_td[data-pinned=left]:not(:has(+td[data-pinned=left]))]:after:w-[30px] [&_td[data-pinned=left]:not(:has(+td[data-pinned=left]))]:after:translate-x-full [&_td[data-pinned=left]:not(:has(+td[data-pinned=left]))]:after:transition-opacity [&_td[data-pinned=left]:not(:has(+td[data-pinned=left]))]:after:duration-200 [&_td[data-pinned=left]:not(:has(+td[data-pinned=left]))]:after:pointer-events-none [&_td[data-pinned=left]:not(:has(+td[data-pinned=left]))]:after:shadow-[inset_10px_0_8px_-8px_var(--pinned-shadow-color)]',
    show: '[&_th[data-pinned=left]:not(:has(+th[data-pinned=left]))]:after:opacity-100 [&_td[data-pinned=left]:not(:has(+td[data-pinned=left]))]:after:opacity-100',
    hide: '[&_th[data-pinned=left]:not(:has(+th[data-pinned=left]))]:after:opacity-0 [&_td[data-pinned=left]:not(:has(+td[data-pinned=left]))]:after:opacity-0'
  },
  right: {
    base: '[&_th:not([data-pinned=right])+th[data-pinned=right]]:before:absolute [&_th:not([data-pinned=right])+th[data-pinned=right]]:before:top-0 [&_th:not([data-pinned=right])+th[data-pinned=right]]:before:left-0 [&_th:not([data-pinned=right])+th[data-pinned=right]]:before:bottom-0 [&_th:not([data-pinned=right])+th[data-pinned=right]]:before:w-[30px] [&_th:not([data-pinned=right])+th[data-pinned=right]]:before:-translate-x-full [&_th:not([data-pinned=right])+th[data-pinned=right]]:before:transition-opacity [&_th:not([data-pinned=right])+th[data-pinned=right]]:before:duration-300 [&_th:not([data-pinned=right])+th[data-pinned=right]]:before:pointer-events-none [&_th:not([data-pinned=right])+th[data-pinned=right]]:before:shadow-[inset_-10px_0_8px_-8px_var(--pinned-shadow-color)] [&_td:not([data-pinned=right])+td[data-pinned=right]]:before:absolute [&_td:not([data-pinned=right])+td[data-pinned=right]]:before:top-0 [&_td:not([data-pinned=right])+td[data-pinned=right]]:before:left-0 [&_td:not([data-pinned=right])+td[data-pinned=right]]:before:bottom-0 [&_td:not([data-pinned=right])+td[data-pinned=right]]:before:w-[30px] [&_td:not([data-pinned=right])+td[data-pinned=right]]:before:-translate-x-full [&_td:not([data-pinned=right])+td[data-pinned=right]]:before:transition-opacity [&_td:not([data-pinned=right])+td[data-pinned=right]]:before:duration-200 [&_td:not([data-pinned=right])+td[data-pinned=right]]:before:pointer-events-none [&_td:not([data-pinned=right])+td[data-pinned=right]]:before:shadow-[inset_-10px_0_8px_-8px_var(--pinned-shadow-color)]',
    show: '[&_th:not([data-pinned=right])+th[data-pinned=right]]:before:opacity-100 [&_td:not([data-pinned=right])+td[data-pinned=right]]:before:opacity-100',
    hide: '[&_th:not([data-pinned=right])+th[data-pinned=right]]:before:opacity-0 [&_td:not([data-pinned=right])+td[data-pinned=right]]:before:opacity-0'
  }
} as const

const EXPANDED_STICKY_CLASS = '[&_tr[data-expanded=true]]:sticky [&_tr[data-expanded=true]]:top-[calc(var(--ui-table-header-height)+1px)] [&_tr[data-expanded=true]]:z-10 [&_tr[data-expanded=true]]:bg-default'

export interface UseProTableViewReturn<T> {
  data: Ref<T[]>
  createRow: (row: T) => void
  updateRow: (row: T) => void
  deleteRow: (row: T) => void
  stats: Ref<StatsItem[][]>
  fetchList: () => Promise<void>
  rowSelection: Ref<Record<number, boolean> | undefined>
  onUpdateRowSelection: (newRowSelection: Record<number, boolean> | undefined) => void
  tblProps: ComputedRef<TableProps<T>>
  tblWhereQueryProps: ComputedRef<WhereQueryProps<T>>
  tblHeaderProps: ComputedRef<TableHeaderProps<T>>
  tblPaginationProps: ComputedRef<TablePaginationProps<T>>
  tblContextMenuItems: Ref<ContextMenuItem[]>
  tableWidth: Ref<number>
  tableDiv: Ref<HTMLDivElement | null>
  updateTableWidth: () => void
  tblClasses: ComputedRef<(string | boolean | (string | boolean)[])[]>
  tblUi: ComputedRef<{ root: string, th: string, td: string }>
  deletingRowKey: Ref<number | null>
  editingRowKey: Ref<number | null>
}

export function useProTableView<T>(props: VTableProps<T>): UseProTableViewReturn<T> {
  const {
    data,
    createRow,
    updateRow,
    deleteRow,
    stats,
    fetchList,
    rowSelection,
    onUpdateRowSelection,
    tblProps: baseTblProps,
    tblWhereQueryProps,
    tblHeaderProps,
    tblPaginationProps,
    tblContextMenuItems,
    deletingRowKey,
    editingRowKey
  } = useTable<T>(props)

  // tr td class
  const thClass = computed(() => {
    const classList: string[] = []
    if (!props.singleRow) {
      classList.push('[&:has([role=checkbox])]:pe-2')
    }
    if (!props.singleColumn) {
      classList.push('border-b')
    }
    return classList.join(' ')
  })

  const tdClass = computed(() => {
    const classList: string[] = []
    if (!props.singleRow) {
      classList.push('border-l first:border-l-0 [&:has([role=checkbox])]:pe-2')
    }
    if (!props.singleColumn) {
      classList.push('group-has-[td:not(:empty)]:border-b')
      if (props.hideLastRowBorder) {
        classList.push('[tr:last-child_td]:border-b-0')
      }
    }
    return classList.join(' ')
  })

  const tableWidth = ref(0)
  const tableDiv = useTemplateRef<HTMLDivElement>('table')
  const columnSizing = ref<ColumnSizingState>({})
  let resizeObserver: ResizeObserver | null = null
  let scrollContainer: HTMLElement | null = null

  // 固定列阴影控制
  const showLeftPinnedShadow = ref(false)
  const showRightPinnedShadow = ref(false)
  // 垂直溢出检测（用于隐藏最后一行 border 避免与 pagination 重叠）
  const hasVerticalOverflow = ref(false)

  const pinnedShadowClasses = computed(() => [
    PINNED_SHADOW_CLASSES.left.base,
    PINNED_SHADOW_CLASSES.right.base,
    showLeftPinnedShadow.value ? PINNED_SHADOW_CLASSES.left.show : PINNED_SHADOW_CLASSES.left.hide,
    showRightPinnedShadow.value ? PINNED_SHADOW_CLASSES.right.show : PINNED_SHADOW_CLASSES.right.hide
  ])

  const HIDE_LAST_ROW_BORDER_CLASS = '[&_tbody_tr:last-child_td]:border-b-0'
  const tblClasses = computed(() => [pinnedShadowClasses.value, EXPANDED_STICKY_CLASS, hasVerticalOverflow.value && HIDE_LAST_ROW_BORDER_CLASS])
  const tblUi = computed(() => ({ root: 'relative overflow-clip', th: thClass.value, td: tdClass.value }))
  const tblProps = computed<TableProps<T>>(() => ({
    ...baseTblProps.value,
    columnSizing: columnSizing.value
  }) as TablePropsWithColumnState<T>)

  function getColumnId(column: unknown): string | undefined {
    if (!column || typeof column !== 'object') return undefined
    const col = column as { id?: string, accessorKey?: string }
    return col.id ?? col.accessorKey
  }

  function updateColumnSizing() {
    if (!tableDiv.value) return

    const leafColumns = baseTblProps.value.columns
      ?.flatMap((column: any) => column.columns ?? [column])
      .map(getColumnId)
      .filter((id): id is string => !!id) ?? []
    const headers = Array.from(tableDiv.value.querySelectorAll<HTMLTableCellElement>('thead tr[data-slot="tr"] th[data-slot="th"]'))
    if (!leafColumns.length || !headers.length) return

    const nextSizing: ColumnSizingState = {}
    headers.slice(0, leafColumns.length).forEach((header, index) => {
      const columnId = leafColumns[index]
      const width = Math.ceil(header.getBoundingClientRect().width)
      if (columnId && width > 0) {
        nextSizing[columnId] = width
      }
    })
    columnSizing.value = nextSizing
  }

  function updateTableWidth() {
    if (tableDiv.value) {
      tableWidth.value = tableDiv.value.offsetWidth
    }
  }

  function checkShadowVisibility() {
    if (!scrollContainer) return

    const { scrollLeft, scrollWidth, clientWidth, scrollHeight, clientHeight } = scrollContainer
    showLeftPinnedShadow.value = scrollLeft > 0
    showRightPinnedShadow.value = scrollLeft + clientWidth < scrollWidth - 1
    hasVerticalOverflow.value = scrollHeight > clientHeight + 1
  }

  function handleScroll(e: Event) {
    const target = e.target as HTMLElement
    const { scrollLeft, scrollWidth, clientWidth } = target

    showLeftPinnedShadow.value = scrollLeft > 0
    showRightPinnedShadow.value = scrollLeft + clientWidth < scrollWidth - 1
  }

  onMounted(() => {
    nextTick(() => {
      if (!tableDiv.value) return

      // 查找滚动容器（优先查找 ProScrollArea 的 viewport）
      const selectors = ['[data-reka-scroll-area-viewport]', '.overflow-x-auto', '[data-scroll-container]', '.overflow-auto', 'div[style*="overflow"]']
      for (const selector of selectors) {
        scrollContainer = tableDiv.value.querySelector(selector)
        if (scrollContainer) break
      }

      if (scrollContainer) {
        scrollContainer.addEventListener('scroll', handleScroll, { passive: true })
      }

      // 监听容器大小变化，重新检查是否需要显示阴影
      if (tableDiv.value) {
        resizeObserver = new ResizeObserver(() => {
          updateTableWidth()
          nextTick(() => {
            updateColumnSizing()
            checkShadowVisibility()
          })
        })
        resizeObserver.observe(tableDiv.value)
        updateTableWidth()
        updateColumnSizing()
        checkShadowVisibility()
      }
    })
  })

  // 监听数据变化，重新检查阴影状态
  watch(data, () => {
    nextTick(() => {
      updateColumnSizing()
      checkShadowVisibility()
    })
  }, { flush: 'post' })

  watch(
    () => [baseTblProps.value.columns, (baseTblProps.value as TablePropsWithColumnState<T>).columnPinning],
    () => {
      nextTick(() => {
        updateColumnSizing()
        checkShadowVisibility()
      })
    },
    { flush: 'post' }
  )

  onUnmounted(() => {
    if (resizeObserver && tableDiv.value) {
      resizeObserver.unobserve(tableDiv.value)
      resizeObserver.disconnect()
      resizeObserver = null
    }

    if (scrollContainer) {
      scrollContainer.removeEventListener('scroll', handleScroll)
      scrollContainer = null
    }
  })

  return {
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
    // props for sub-components
    tblProps,
    tblWhereQueryProps,
    tblHeaderProps,
    tblPaginationProps,
    // context menu
    tblContextMenuItems,
    // view
    tableWidth,
    tableDiv,
    updateTableWidth,
    tblClasses,
    tblUi,
    deletingRowKey,
    editingRowKey
  } as UseProTableViewReturn<T>
}
