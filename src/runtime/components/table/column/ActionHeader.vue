<script setup lang="ts">
import type { OrderQueryOpr } from '#v/types'
import type { ColumnPinningPosition } from '@tanstack/table-core'
import type { DropdownMenuItem } from '@nuxt/ui'
import { computed } from 'vue'

const props = defineProps<{
  label: string
  accessorKey: string
  fetchList: () => Promise<void>
  disabled?: boolean

  // order
  enableOrder?: boolean
  isOrdered?: boolean
  orderOpr?: OrderQueryOpr
  orderIndex?: number
  onUpdateOrderOpr: (opr: OrderQueryOpr) => void

  // pin
  isPinned: ColumnPinningPosition
  onUpdatePinned: (position: 'left' | 'right' | 'unfixed') => void

  // filter
  enableFilter?: boolean
  onFilterClick?: (field: string) => void

  // hide
  onHideColumn?: (accessorKey: string) => void
}>()

const isOrderedAsc = computed(() => props.isOrdered && props.orderOpr === 'asc')
const isOrderedDesc = computed(() => props.isOrdered && props.orderOpr === 'desc')
const isPinnedLeft = computed(() => props.isPinned === 'left')
const isPinnedRight = computed(() => props.isPinned === 'right')
const isUnpinned = computed(() => !props.isPinned)
const headerIcon = computed(() => {
  if (isPinnedLeft.value || isPinnedRight.value) return 'i-lucide-pin'
  return undefined
})

const onClickAsc = async () => {
  props.onUpdateOrderOpr(isOrderedAsc.value ? null : 'asc')
  await props.fetchList()
}
const onClickDesc = async () => {
  props.onUpdateOrderOpr(isOrderedDesc.value ? null : 'desc')
  await props.fetchList()
}

function groupLabel(label: string): DropdownMenuItem {
  return { type: 'label', label }
}

function createActionItem(item: DropdownMenuItem): DropdownMenuItem {
  return {
    ...item,
    disabled: props.disabled || item.disabled
  }
}

async function applyOrderOpr(opr: OrderQueryOpr) {
  props.onUpdateOrderOpr(opr)
  await props.fetchList()
}

const filterItems = computed<DropdownMenuItem[]>(() => {
  if (!props.enableFilter) return []
  return [
    createActionItem({
      label: '筛选',
      icon: 'i-lucide-list-filter',
      onSelect: () => props.onFilterClick?.(props.accessorKey)
    })
  ]
})

const sortItems = computed<DropdownMenuItem[]>(() => {
  if (!props.enableOrder) return []
  return [
    groupLabel('排序'),
    createActionItem({
      label: '升序',
      icon: 'i-lucide-arrow-up-narrow-wide',
      type: 'checkbox',
      checked: isOrderedAsc.value,
      onSelect: () => applyOrderOpr(isOrderedAsc.value ? null : 'asc')
    }),
    createActionItem({
      label: '降序',
      icon: 'i-lucide-arrow-down-wide-narrow',
      type: 'checkbox',
      checked: isOrderedDesc.value,
      onSelect: () => applyOrderOpr(isOrderedDesc.value ? null : 'desc')
    }),
    createActionItem({
      label: '取消排序',
      icon: 'i-lucide-arrow-up-down',
      type: 'checkbox',
      checked: !props.isOrdered,
      disabled: props.disabled || !props.isOrdered,
      onSelect: () => applyOrderOpr(null)
    })
  ]
})

const pinItems = computed<DropdownMenuItem[]>(() => [
  groupLabel('固定'),
  createActionItem({
    label: '固定在左侧',
    icon: 'i-lucide-arrow-left-to-line',
    type: 'checkbox',
    checked: isPinnedLeft.value,
    onSelect: () => props.onUpdatePinned(isPinnedLeft.value ? 'unfixed' : 'left')
  }),
  createActionItem({
    label: '固定在右侧',
    icon: 'i-lucide-arrow-right-to-line',
    type: 'checkbox',
    checked: isPinnedRight.value,
    onSelect: () => props.onUpdatePinned(isPinnedRight.value ? 'unfixed' : 'right')
  }),
  createActionItem({
    label: '不固定',
    icon: 'i-lucide-pin-off',
    type: 'checkbox',
    checked: isUnpinned.value,
    disabled: props.disabled || isUnpinned.value,
    onSelect: () => props.onUpdatePinned('unfixed')
  })
])

const visibilityItems = computed<DropdownMenuItem[]>(() => {
  if (!props.onHideColumn) return []
  return [
    groupLabel('显示'),
    createActionItem({
      label: '隐藏列',
      icon: 'i-lucide-eye-off',
      color: 'warning',
      onSelect: () => props.onHideColumn?.(props.accessorKey)
    })
  ]
})

// dropdown menu items
const dropdownItems = computed<DropdownMenuItem[][]>(() =>
  [
    filterItems.value,
    sortItems.value,
    pinItems.value,
    visibilityItems.value
  ].filter(group => group.length > 0)
)
</script>

<template>
  <div class="flex">
    <UDropdownMenu
      :items="dropdownItems"
      size="sm"
      :content="{ align: 'start', side: 'bottom' }"
    >
      <UButton
        :label="label"
        :color="isOrdered ? 'primary' : 'neutral'"
        :variant="isOrdered ? 'soft' : 'ghost'"
        :disabled="disabled"
        :icon="headerIcon"
        class="px-4 font-bold rounded-none h-(--ui-table-header-height) w-full"
        :ui="{
          leadingIcon: 'text-neutral-400 size-4',
          trailingIcon: 'size-3 text-dimmed'
        }"
      />
    </UDropdownMenu>
    <div v-if="isOrdered" class="flex flex-col">
      <UChip
        size="xl"
        :text="orderIndex"
        inset
        :show="isOrderedAsc && orderIndex !== undefined"
      >
        <UButton
          :color="isOrdered ? 'primary' : 'neutral'"
          :variant="isOrdered ? 'soft' : 'ghost'"
          :disabled="disabled"
          trailing-icon="i-lucide-arrow-up-narrow-wide"
          class="px-2 font-bold rounded-none w-full h-[calc(var(--ui-table-header-height)/2)]"
          :ui="{
            trailingIcon: `${!isOrderedAsc ? 'text-neutral-300 dark:text-neutral-500' : ''} size-4 transition-all`
          }"
          @click="onClickAsc"
        />
      </UChip>
      <UChip
        size="xl"
        :text="orderIndex"
        inset
        :show="isOrderedDesc && orderIndex !== undefined"
      >
        <UButton
          :color="isOrdered ? 'primary' : 'neutral'"
          :variant="isOrdered ? 'soft' : 'ghost'"
          :disabled="disabled"
          trailing-icon="i-lucide-arrow-down-wide-narrow"
          class="px-2 font-bold rounded-none w-full h-[calc(var(--ui-table-header-height)/2)]"
          :ui="{
            trailingIcon: `${!isOrderedDesc ? 'text-neutral-300 dark:text-neutral-500' : ''} size-4 transition-all`
          }"
          @click="onClickDesc"
        />
      </UChip>
    </div>
  </div>
</template>
