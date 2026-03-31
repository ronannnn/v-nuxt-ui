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

const onClickAsc = async () => {
  props.onUpdateOrderOpr(isOrderedAsc.value ? null : 'asc')
  await props.fetchList()
}
const onClickDesc = async () => {
  props.onUpdateOrderOpr(isOrderedDesc.value ? null : 'desc')
  await props.fetchList()
}

// dropdown menu items
const dropdownItems = computed<DropdownMenuItem[]>(() => {
  const groups: DropdownMenuItem[] = []

  // 筛选
  if (props.enableFilter) {
    groups.push({
      label: '筛选',
      icon: 'i-lucide-list-filter',
      onSelect: () => props.onFilterClick?.(props.accessorKey)
    })
  }

  // 隐藏列
  groups.push({
    label: '隐藏列',
    icon: 'i-lucide-eye-off',
    onSelect: () => props.onHideColumn?.(props.accessorKey)
  })

  // 固定列
  groups.push({
    label: '固定列',
    icon: 'i-lucide-pin',
    children: [
      {
        label: '固定在左侧',
        icon: 'i-lucide-panel-left',
        type: 'checkbox' as const,
        checked: props.isPinned === 'left',
        onSelect: () => props.onUpdatePinned(props.isPinned === 'left' ? 'unfixed' : 'left')
      },
      {
        label: '固定在右侧',
        icon: 'i-lucide-panel-right',
        type: 'checkbox' as const,
        checked: props.isPinned === 'right',
        onSelect: () => props.onUpdatePinned(props.isPinned === 'right' ? 'unfixed' : 'right')
      }
    ]
  })

  // 排序
  if (props.enableOrder) {
    const isAsc = isOrderedAsc.value
    const isDesc = isOrderedDesc.value
    groups.push({
      label: '排序',
      icon: 'i-lucide-arrow-up-down',
      children: [
        {
          label: '升序',
          icon: 'i-lucide-arrow-up',
          type: 'checkbox' as const,
          checked: isAsc,
          onSelect: async () => {
            props.onUpdateOrderOpr(isAsc ? null : 'asc')
            await props.fetchList()
          }
        },
        {
          label: '降序',
          icon: 'i-lucide-arrow-down',
          type: 'checkbox' as const,
          checked: isDesc,
          onSelect: async () => {
            props.onUpdateOrderOpr(isDesc ? null : 'desc')
            await props.fetchList()
          }
        }
      ]
    })
  }

  return groups
})
</script>

<template>
  <div class="flex">
    <UDropdownMenu
      :items="dropdownItems"
      :content="{ align: 'start', side: 'bottom' }"
    >
      <UButton
        :label="label"
        :color="isOrdered ? 'primary' : 'neutral'"
        :variant="isOrdered ? 'soft' : 'ghost'"
        :disabled="disabled"
        :icon="isPinned ? 'i-lucide-pin' : undefined"
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
