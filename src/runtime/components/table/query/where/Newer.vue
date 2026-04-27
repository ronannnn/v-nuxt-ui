<script setup lang="ts" generic="T">
import type { WhereQueryOption, VColumn, Size } from '#v/types'
import type { ListboxItem } from '@nuxt/ui'
import { ref, computed } from 'vue'
import ButtonDropdown from '#v/components/button/Dropdown.vue'
import { tableWhereQueryItemIconMap } from '#v/constants'

const props = defineProps<{
  options: WhereQueryOption<T>[]
  unselectedFields: string[]
  bizColumns: VColumn<T>[]
  size?: Size
}>()
const emit = defineEmits<{
  new: [string]
}>()

const popoverOpen = ref(false)

const unselectedOptions = computed<ListboxItem[]>(() => props.unselectedFields.map((field) => {
  const option = props.options.find(option => option.field === field)
  const column = props.bizColumns.find(column => (column as any)['accessorKey'] === field)
  return {
    label: column?.header as string || option?.label || field,
    icon: tableWhereQueryItemIconMap.get(option?.type ?? 'unknown') || 'field',
    onSelect: () => {
      emit('new', field)
      popoverOpen.value = false
    }
  }
}))
</script>

<template>
  <!-- NOTE: 自己实现DropdownMenu, 原生DropdownMenu的Focus有问题，会让查询字段打开的Popover关闭 -->
  <ButtonDropdown :items="unselectedOptions">
    <UButton
      label="新增"
      :size="size"
      color="neutral"
      variant="subtle"
      icon="i-lucide-list-filter-plus"
    />
  </ButtonDropdown>
</template>
