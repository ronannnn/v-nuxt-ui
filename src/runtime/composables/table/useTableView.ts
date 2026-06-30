import { ref, shallowRef, computed, watch, onMounted, onUnmounted, nextTick, useTemplateRef } from 'vue'
import type { Ref, ComputedRef } from 'vue'
import type { VTableProps, TableHeaderProps, TablePaginationProps, WhereQueryProps, StatsItem } from '#v/types'
import type { TableProps, ContextMenuItem } from '@nuxt/ui'
import type { ColumnPinningState, ColumnSizingState } from '@tanstack/table-core'
import { useTable } from './useTable'

type TablePropsWithColumnState<T> = TableProps<T> & {
  columnPinning?: ColumnPinningState
  columnSizing?: ColumnSizingState
}

type TableColumnLike = {
  id?: string
  accessorKey?: string
  columns?: TableColumnLike[]
} & Record<string, unknown>

type PinnedColumnOffsets = {
  left: Array<[number, number]>
  right: Array<[number, number]>
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

const EXPANDED_ROW_CLASS = [
  '[&_tr[data-expanded=true]]:bg-default',
  '[&_tr[data-expanded=true]]:!transition-none',
  '[&_tr[data-expanded=true]_td]:!bg-default',
  '[&_tr[data-expanded=true]_td]:!transition-none',
  '[&_tbody_tr[data-expanded=true]:hover_td]:!bg-muted',
  '[&_tr[data-expanded-sticky=true]]:sticky',
  '[&_tr[data-expanded-sticky=true]]:top-[calc(var(--ui-table-header-height)+1px)]',
  '[&_tr[data-expanded-sticky=true]]:z-10',
  '[&_tr[data-expanded=true]+tr_td]:!bg-default'
].join(' ')
const PINNED_POSITION_CLASS = [
  '[&_th[data-pinned=left]]:!transition-colors',
  '[&_th[data-pinned=right]]:!transition-colors',
  '[&_td[data-pinned=left]]:!transition-colors',
  '[&_td[data-pinned=right]]:!transition-colors',
  '[&_th[data-pinned=left]]:!duration-150',
  '[&_th[data-pinned=right]]:!duration-150',
  '[&_td[data-pinned=left]]:!duration-150',
  '[&_td[data-pinned=right]]:!duration-150'
].join(' ')
const PINNED_HOVER_CLASS = '[&_tbody_tr:hover_td[data-pinned=left]]:!bg-muted [&_tbody_tr:hover_td[data-pinned=right]]:!bg-muted'
const HIDE_LAST_ROW_BORDER_CLASS = '[&_tbody_tr:last-child_td]:border-b-0'
const TABLE_ROOT_CLASS = 'relative overflow-clip'
const TABLE_HEAD_CLASS = '!bg-default !backdrop-blur-none'

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
  tblUi: ComputedRef<{ root: string, thead: string, th: string, td: string }>
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
    const classList: string[] = ['bg-default']
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

  const tableWidth = shallowRef(0)
  const tableDiv = useTemplateRef<HTMLDivElement>('table')
  const columnSizing = ref<ColumnSizingState>({})
  let resizeObserver: ResizeObserver | null = null
  let mutationObserver: MutationObserver | null = null
  let scrollContainer: HTMLElement | null = null
  let pinnedOffsetFrame: number | null = null
  let tableDomUpdateQueued = false
  let postRenderPinnedOffsetQueued = false
  let renderedTableStateQueued = false

  const showLeftPinnedShadow = shallowRef(false)
  const showRightPinnedShadow = shallowRef(false)
  const hasVerticalOverflow = shallowRef(false)

  const pinnedShadowClasses = computed(() => [
    PINNED_SHADOW_CLASSES.left.base,
    PINNED_SHADOW_CLASSES.right.base,
    showLeftPinnedShadow.value ? PINNED_SHADOW_CLASSES.left.show : PINNED_SHADOW_CLASSES.left.hide,
    showRightPinnedShadow.value ? PINNED_SHADOW_CLASSES.right.show : PINNED_SHADOW_CLASSES.right.hide
  ])

  const tblClasses = computed(() => [pinnedShadowClasses.value, EXPANDED_ROW_CLASS, PINNED_POSITION_CLASS, PINNED_HOVER_CLASS, hasVerticalOverflow.value && HIDE_LAST_ROW_BORDER_CLASS])
  const tblUi = computed(() => ({ root: TABLE_ROOT_CLASS, thead: TABLE_HEAD_CLASS, th: thClass.value, td: tdClass.value }))
  const tblProps = computed<TableProps<T>>(() => ({
    ...baseTblProps.value,
    columnSizing: columnSizing.value
  }) as TablePropsWithColumnState<T>)

  function getColumnId(column: unknown): string | undefined {
    if (!column || typeof column !== 'object') return undefined
    const col = column as { id?: string, accessorKey?: string }
    return col.id ?? col.accessorKey
  }

  function getLeafColumnIds(columns: unknown[]): string[] {
    return columns.flatMap((column) => {
      if (!column || typeof column !== 'object') return []
      const col = column as TableColumnLike
      if (Array.isArray(col.columns) && col.columns.length) {
        return getLeafColumnIds(col.columns)
      }
      const columnId = getColumnId(column)
      return columnId ? [columnId] : []
    })
  }

  function getRenderedLeafColumnIds(columns: unknown[], columnPinning?: ColumnPinningState): string[] {
    const columnIds = getLeafColumnIds(columns)
    const columnIdSet = new Set(columnIds)
    const leftIds = columnPinning?.left?.filter(id => columnIdSet.has(id)) ?? []
    const rightIds = columnPinning?.right?.filter(id => columnIdSet.has(id)) ?? []
    const pinnedIds = new Set([...leftIds, ...rightIds])
    const centerIds = columnIds.filter(id => !pinnedIds.has(id))
    return [...leftIds, ...centerIds, ...rightIds]
  }

  function isSameColumnSizing(prev: ColumnSizingState, next: ColumnSizingState): boolean {
    const prevKeys = Object.keys(prev)
    const nextKeys = Object.keys(next)
    return prevKeys.length === nextKeys.length && nextKeys.every(key => prev[key] === next[key])
  }

  function getElementWidth(element: HTMLElement): number {
    return element.getBoundingClientRect().width
  }

  function getDirectTableCells(row: HTMLTableRowElement): HTMLTableCellElement[] {
    return Array.from(row.children).filter((cell): cell is HTMLTableCellElement => cell instanceof HTMLTableCellElement && (cell.dataset.slot === 'th' || cell.dataset.slot === 'td'))
  }

  function getTableRows(): HTMLTableRowElement[] {
    if (!tableDiv.value) return []
    return Array.from(tableDiv.value.querySelectorAll<HTMLTableRowElement>('tr[data-slot="tr"]'))
  }

  function findScrollContainer(): HTMLElement | null {
    if (!tableDiv.value) return null

    const selectors = ['[data-reka-scroll-area-viewport]', '.overflow-x-auto', '[data-scroll-container]', '.overflow-auto', 'div[style*="overflow"]']
    for (const selector of selectors) {
      const candidate = tableDiv.value.querySelector<HTMLElement>(selector)
      if (candidate) return candidate
    }

    return null
  }

  function updateColumnSizing(): boolean {
    if (!tableDiv.value) return false

    const leafColumns = getRenderedLeafColumnIds((baseTblProps.value.columns ?? []) as unknown[], (baseTblProps.value as TablePropsWithColumnState<T>).columnPinning)
    const headers = Array.from(tableDiv.value.querySelectorAll<HTMLTableCellElement>('thead tr[data-slot="tr"] th[data-slot="th"]'))
    const bodyRows = Array.from(tableDiv.value.querySelectorAll<HTMLTableRowElement>('tbody tr[data-slot="tr"]'))
    if (!leafColumns.length || !headers.length) return false

    const nextSizing: ColumnSizingState = {}
    headers.slice(0, leafColumns.length).forEach((header, index) => {
      const columnId = leafColumns[index]
      let width = getElementWidth(header)
      bodyRows.forEach((row) => {
        const cell = row.children[index]
        if (cell instanceof HTMLElement) {
          width = Math.max(width, getElementWidth(cell))
        }
      })
      if (columnId && width > 0) {
        nextSizing[columnId] = Math.ceil(width)
      }
    })
    if (isSameColumnSizing(columnSizing.value, nextSizing)) return false
    columnSizing.value = nextSizing
    return true
  }

  function getPinnedColumnOffsets(headerCells: HTMLTableCellElement[]): PinnedColumnOffsets {
    const offsets: PinnedColumnOffsets = { left: [], right: [] }

    let leftOffset = 0
    headerCells.forEach((cell, index) => {
      if (cell.dataset.pinned !== 'left') return
      offsets.left.push([index, leftOffset])
      leftOffset += getElementWidth(cell)
    })

    let rightOffset = 0
    for (let index = headerCells.length - 1; index >= 0; index--) {
      const cell = headerCells[index]
      if (!cell || cell.dataset.pinned !== 'right') continue
      offsets.right.push([index, rightOffset])
      rightOffset += getElementWidth(cell)
    }

    return offsets
  }

  function updatePinnedColumnOffsets() {
    if (!tableDiv.value) return

    const headerRow = tableDiv.value.querySelector<HTMLTableRowElement>('thead tr[data-slot="tr"]')
    if (!headerRow) return

    const headerCells = getDirectTableCells(headerRow)
    if (!headerCells.length) return

    const offsets = getPinnedColumnOffsets(headerCells)

    if (!offsets.left.length && !offsets.right.length) return

    const setCellOffset = (cell: HTMLTableCellElement, side: 'left' | 'right', offset: number) => {
      const value = `${offset}px`
      if (cell.style[side] !== value) {
        cell.style[side] = value
      }
    }

    getTableRows().forEach((row) => {
      const cells = getDirectTableCells(row)
      if (!cells.length) return

      offsets.left.forEach(([index, offset]) => {
        const cell = cells[index]
        if (cell?.dataset.pinned === 'left') {
          setCellOffset(cell, 'left', offset)
        }
      })

      offsets.right.forEach(([index, offset]) => {
        const cell = cells[index]
        if (cell?.dataset.pinned === 'right') {
          setCellOffset(cell, 'right', offset)
        }
      })
    })
  }

  function queuePinnedColumnOffsetUpdate(immediate = true) {
    if (immediate) {
      updatePinnedColumnOffsets()
    }
    if (typeof requestAnimationFrame !== 'function') return

    if (pinnedOffsetFrame !== null) {
      return
    }

    pinnedOffsetFrame = requestAnimationFrame(() => {
      pinnedOffsetFrame = null
      updatePinnedColumnOffsets()
    })
  }

  function queuePostRenderPinnedColumnOffsetUpdate() {
    if (postRenderPinnedOffsetQueued) return
    postRenderPinnedOffsetQueued = true
    nextTick(() => {
      postRenderPinnedOffsetQueued = false
      queuePinnedColumnOffsetUpdate()
      updateScrollState()
    })
  }

  function updateRenderedTableState() {
    const columnSizingChanged = updateColumnSizing()
    queuePinnedColumnOffsetUpdate()
    if (columnSizingChanged) {
      queuePostRenderPinnedColumnOffsetUpdate()
    }
    updateScrollState()
  }

  function queueRenderedTableStateUpdate() {
    if (renderedTableStateQueued) return
    renderedTableStateQueued = true
    nextTick(() => {
      renderedTableStateQueued = false
      updateRenderedTableState()
    })
  }

  function queueTableDomUpdate() {
    if (tableDomUpdateQueued) return
    tableDomUpdateQueued = true

    const runUpdate = () => {
      tableDomUpdateQueued = false
      updateRenderedTableState()
    }

    if (typeof queueMicrotask === 'function') {
      queueMicrotask(runUpdate)
      return
    }

    Promise.resolve().then(runUpdate)
  }

  function updateTableWidth() {
    if (tableDiv.value) {
      tableWidth.value = tableDiv.value.offsetWidth
    }
  }

  function updateScrollState() {
    checkShadowVisibility()
    updateExpandedStickyRows()
  }

  function checkShadowVisibility() {
    if (!scrollContainer) return

    const { scrollLeft, scrollWidth, clientWidth, scrollHeight, clientHeight } = scrollContainer
    showLeftPinnedShadow.value = scrollLeft > 0
    showRightPinnedShadow.value = scrollLeft + clientWidth < scrollWidth - 1
    hasVerticalOverflow.value = scrollHeight > clientHeight + 1
  }

  function resetExpandedStickyRow(row: HTMLTableRowElement) {
    delete row.dataset.expandedSticky
    row.style.transform = ''
  }

  function getExpandedContentRow(row: HTMLTableRowElement): HTMLTableRowElement | null {
    const nextRow = row.nextElementSibling
    if (!(nextRow instanceof HTMLTableRowElement)) return null
    return nextRow.querySelector('[role="expand-row"]') ? nextRow : null
  }

  function updateExpandedStickyRow(row: HTMLTableRowElement, headerBottom: number) {
    const expandedContentRow = getExpandedContentRow(row)
    if (!expandedContentRow) {
      resetExpandedStickyRow(row)
      return
    }

    const rowRect = row.getBoundingClientRect()
    const expandedRect = expandedContentRow.getBoundingClientRect()
    if (rowRect.top > headerBottom || expandedRect.bottom <= headerBottom) {
      resetExpandedStickyRow(row)
      return
    }

    const translateY = Math.min(0, expandedRect.bottom - headerBottom - rowRect.height)
    row.dataset.expandedSticky = 'true'
    row.style.transform = `translateY(${translateY}px)`
  }

  function updateExpandedStickyRows() {
    if (!tableDiv.value) return

    const header = tableDiv.value.querySelector<HTMLElement>('thead[data-slot="thead"]')
    const headerBottom = header?.getBoundingClientRect().bottom ?? 0
    const expandedRows = Array.from(tableDiv.value.querySelectorAll<HTMLTableRowElement>('tbody tr[data-expanded="true"]'))

    expandedRows.forEach((row) => {
      updateExpandedStickyRow(row, headerBottom)
    })
  }

  function handleScroll(e: Event) {
    const target = e.target as HTMLElement
    const { scrollLeft, scrollWidth, clientWidth } = target

    showLeftPinnedShadow.value = scrollLeft > 0
    showRightPinnedShadow.value = scrollLeft + clientWidth < scrollWidth - 1
    queuePinnedColumnOffsetUpdate(false)
    updateExpandedStickyRows()
  }

  onMounted(() => {
    nextTick(() => {
      if (!tableDiv.value) return

      scrollContainer = findScrollContainer()
      if (scrollContainer) {
        scrollContainer.addEventListener('scroll', handleScroll, { passive: true })
      }

      resizeObserver = new ResizeObserver(() => {
        updateTableWidth()
        queueRenderedTableStateUpdate()
      })
      resizeObserver.observe(tableDiv.value)

      mutationObserver = new MutationObserver(queueTableDomUpdate)
      mutationObserver.observe(tableDiv.value.querySelector('tbody') ?? tableDiv.value, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['data-expanded']
      })

      updateTableWidth()
      updateRenderedTableState()
    })
  })

  // 监听数据变化，重新检查阴影状态
  watch(data, () => {
    queueRenderedTableStateUpdate()
  }, { flush: 'post' })

  watch(
    () => [baseTblProps.value.columns, (baseTblProps.value as TablePropsWithColumnState<T>).columnPinning],
    () => {
      queueRenderedTableStateUpdate()
    },
    { flush: 'post' }
  )

  onUnmounted(() => {
    if (resizeObserver && tableDiv.value) {
      resizeObserver.unobserve(tableDiv.value)
      resizeObserver.disconnect()
      resizeObserver = null
    }

    if (mutationObserver) {
      mutationObserver.disconnect()
      mutationObserver = null
    }

    if (scrollContainer) {
      scrollContainer.removeEventListener('scroll', handleScroll)
      scrollContainer = null
    }

    if (pinnedOffsetFrame !== null) {
      cancelAnimationFrame(pinnedOffsetFrame)
      pinnedOffsetFrame = null
    }

    tableDomUpdateQueued = false
    postRenderPinnedOffsetQueued = false
    renderedTableStateQueued = false
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
