<script setup lang="ts" generic="T extends Record<string, any>">
import type { WhereQueryOption, VColumn, Size } from '#v/types'
import type { CommandPaletteGroup } from '@nuxt/ui'
import { ref, computed } from 'vue'
import ButtonDropdown from '#v/components/button/Dropdown.vue'

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

const unselectedOptions = computed(() => {
  const options: CommandPaletteGroup[] = [
    {
      id: 'unselected-fields',
      label: '新增查询字段',
      items: props.unselectedFields.map((field) => {
        const option = props.options.find(option => option.field === field)
        const column = props.bizColumns.find(column => (column as any)['accessorKey'] === field)
        return {
          label: column?.header as string || option?.label || field,
          onSelect: () => {
            emit('new', field)
            popoverOpen.value = false
          }
        }
      })
    }
  ]
  return options
})
</script>

<template>
  <!-- NOTE: 自己实现DropdownMenu, 原生DropdownMenu的Focus有问题，会让查询字段打开的Popover关闭 -->
  <ButtonDropdown :groups="unselectedOptions">
    <UButton
      label="新增"
      :size="size"
      color="neutral"
      variant="subtle"
      icon="i-lucide-list-filter-plus"
    />
  </ButtonDropdown>
</template>
