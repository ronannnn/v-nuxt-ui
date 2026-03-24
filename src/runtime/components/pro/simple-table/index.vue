<script setup lang="ts" generic="T">
import { UBadge, UButton } from '#components'
import type { VColumn, VTableProps } from '../../../types/components'

const props = withDefaults(defineProps<
  Pick<
    VTableProps<T>,
  'singleRow' | 'singleColumn' | 'hideLastRowBorder' | 'bizColumns'
  >
  & {
    data: T[]
  }
>(), {
  singleRow: true,
  singleColumn: false
})

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
  const classList: string[] = ['py-1.5']
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
const tableDiv = useTemplateRef('table')
let resizeObserver: ResizeObserver | null = null
let scrollContainer: HTMLElement | null = null

// 固定列阴影控制
const showLeftPinnedShadow = ref(false)
const showRightPinnedShadow = ref(false)

// 固定列阴影样式常量
const PINNED_SHADOW_CLASSES = {
  left: {
    base: '[&_th[data-pinned=left]]:after:absolute [&_th[data-pinned=left]]:after:top-0 [&_th[data-pinned=left]]:after:right-0 [&_th[data-pinned=left]]:after:bottom-0 [&_th[data-pinned=left]]:after:w-[30px] [&_th[data-pinned=left]]:after:translate-x-full [&_th[data-pinned=left]]:after:transition-opacity [&_th[data-pinned=left]]:after:duration-300 [&_th[data-pinned=left]]:after:pointer-events-none [&_th[data-pinned=left]]:after:shadow-[inset_10px_0_8px_-8px_rgba(0,0,0,0.15)] [&_td[data-pinned=left]]:after:absolute [&_td[data-pinned=left]]:after:top-0 [&_td[data-pinned=left]]:after:right-0 [&_td[data-pinned=left]]:after:bottom-0 [&_td[data-pinned=left]]:after:w-[30px] [&_td[data-pinned=left]]:after:translate-x-full [&_td[data-pinned=left]]:after:transition-opacity [&_td[data-pinned=left]]:after:duration-200 [&_td[data-pinned=left]]:after:pointer-events-none [&_td[data-pinned=left]]:after:shadow-[inset_10px_0_8px_-8px_rgba(0,0,0,0.15)]',
    show: '[&_th[data-pinned=left]]:after:opacity-100 [&_td[data-pinned=left]]:after:opacity-100',
    hide: '[&_th[data-pinned=left]]:after:opacity-0 [&_td[data-pinned=left]]:after:opacity-0'
  },
  right: {
    base: '[&_th[data-pinned=right]]:before:absolute [&_th[data-pinned=right]]:before:top-0 [&_th[data-pinned=right]]:before:left-0 [&_th[data-pinned=right]]:before:bottom-0 [&_th[data-pinned=right]]:before:w-[30px] [&_th[data-pinned=right]]:before:-translate-x-full [&_th[data-pinned=right]]:before:transition-opacity [&_th[data-pinned=right]]:before:duration-300 [&_th[data-pinned=right]]:before:pointer-events-none [&_th[data-pinned=right]]:before:shadow-[inset_-10px_0_8px_-8px_rgba(0,0,0,0.15)] [&_td[data-pinned=right]]:before:absolute [&_td[data-pinned=right]]:before:top-0 [&_td[data-pinned=right]]:before:left-0 [&_td[data-pinned=right]]:before:bottom-0 [&_td[data-pinned=right]]:before:w-[30px] [&_td[data-pinned=right]]:before:-translate-x-full [&_td[data-pinned=right]]:before:transition-opacity [&_td[data-pinned=right]]:before:duration-200 [&_td[data-pinned=right]]:before:pointer-events-none [&_td[data-pinned=right]]:before:shadow-[inset_-10px_0_8px_-8px_rgba(0,0,0,0.15)]',
    show: '[&_th[data-pinned=right]]:before:opacity-100 [&_td[data-pinned=right]]:before:opacity-100',
    hide: '[&_th[data-pinned=right]]:before:opacity-0 [&_td[data-pinned=right]]:before:opacity-0'
  }
} as const

const pinnedShadowClasses = computed(() => [
  PINNED_SHADOW_CLASSES.left.base,
  PINNED_SHADOW_CLASSES.right.base,
  showLeftPinnedShadow.value ? PINNED_SHADOW_CLASSES.left.show : PINNED_SHADOW_CLASSES.left.hide,
  showRightPinnedShadow.value ? PINNED_SHADOW_CLASSES.right.show : PINNED_SHADOW_CLASSES.right.hide
])

function updateTableWidth() {
  if (tableDiv.value) {
    tableWidth.value = tableDiv.value.offsetWidth
  }
}

function checkShadowVisibility() {
  if (!scrollContainer) return

  const { scrollLeft, scrollWidth, clientWidth } = scrollContainer
  showLeftPinnedShadow.value = scrollLeft > 0
  showRightPinnedShadow.value = scrollLeft + clientWidth < scrollWidth - 1
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

    // 查找滚动容器
    const selectors = ['.overflow-x-auto', '[data-scroll-container]', '.overflow-auto', 'div[style*="overflow"]']
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
        // 容器大小变化时重新检查滚动状态
        nextTick(() => checkShadowVisibility())
      })
      resizeObserver.observe(tableDiv.value)
      updateTableWidth()
      // 初始化检查
      checkShadowVisibility()
    }
  })
})

// 监听数据变化，重新检查阴影状态
watch(props.data, () => {
  nextTick(() => checkShadowVisibility())
}, { flush: 'post' })

onUnmounted(() => {
  if (resizeObserver && tableDiv.value) {
    resizeObserver.unobserve(tableDiv.value)
    resizeObserver.disconnect()
    resizeObserver = null
  }

  // 移除滚动监听
  if (scrollContainer) {
    scrollContainer.removeEventListener('scroll', handleScroll)
    scrollContainer = null
  }
})

const columnsWithHeader = computed(() => props.bizColumns.map(col => ({
  ...col,
  header: () => {
    return h(UButton, {
      label: col.header as string,
      color: 'neutral',
      variant: 'link',
      class: 'px-4 font-bold w-full text-highlighted'
    })
  }
} as VColumn<T>)) || [])

const columnsWithFilterOptions = computed<VColumn<T>[]>(() => {
  return columnsWithHeader.value.map((col) => {
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
            return item ? h(UBadge, { color: item?.color ?? 'neutral', variant: (col.filterOption as any)?.['variant'] ?? 'outline' }, () => item?.label ?? '未知值') : ''
          }
        }
      default:
        return col
    }
  }) as VColumn<T>[]
})
</script>

<template>
  <div ref="table" class="flex flex-col h-full">
    <UTable
      class="flex-1"
      :data="data"
      :columns="columnsWithFilterOptions"
      :class="pinnedShadowClasses"
      :ui="{
        th: thClass,
        td: tdClass
      }"
      @resize="updateTableWidth"
    />
  </div>
</template>
