<script setup lang="ts" generic="T">
import type { OrderQueryOption, VColumn } from '#v/types'
import type { CommandPaletteGroup } from '@nuxt/ui'
import { ref, computed } from 'vue'

const props = defineProps<{
  options: OrderQueryOption<T>[]
  unselectedFields: string[]
  bizColumns: VColumn<T>[]
}>()
const emit = defineEmits<{
  new: [string]
}>()

const popoverOpen = ref(false)

const unselectedOptions = computed(() => {
  const options: CommandPaletteGroup<any>[] = [
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
  <UPopover v-model:open="popoverOpen">
    <UButton
      size="sm"
      icon="i-lucide-plus"
      variant="ghost"
    >
      新增排序条件
    </UButton>

    <template #content>
      <UCommandPalette
        :groups="unselectedOptions"
        :ui="{ input: '[&>input]:h-8 [&>input]:text-sm' }"
        placeholder="搜索未选字段"
      />
    </template>
  </UPopover>
</template>
