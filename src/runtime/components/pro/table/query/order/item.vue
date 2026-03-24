<script setup lang="ts" generic="T">
import type { OrderQueryOpr, OrderQueryOption, VColumn } from '../../../../../types'
import type { DropdownMenuItem } from '@nuxt/ui'

const props = defineProps<{
  field: string
  bizColumns: VColumn<T>[]
  opr: OrderQueryOpr
  orderOptions: OrderQueryOption<any>[]
  unselectedFields: string[]
}>()
const emit = defineEmits<{
  change: [string, OrderQueryOpr]
  remove: []
}>()

const selectedValue = computed({
  get() {
    return props.field
  },
  set(newField) {
    emit('change', newField, props.opr)
  }
})
const selectedLabel = computed(() => {
  const option = props.orderOptions.find(option => option.field === props.field)
  const column = props.bizColumns.find(column => (column as any)['accessorKey'] === props.field)
  return column?.header as string || option?.label || props.field
})
const unselectedOptions = computed(() => {
  const options: DropdownMenuItem[] = [props.field].concat(props.unselectedFields).map((field) => {
    const option = props.orderOptions.find(option => option.field === field)
    const column = props.bizColumns.find(column => (column as any)['accessorKey'] === field)
    return {
      type: 'checkbox',
      value: field,
      checked: selectedValue.value === field,
      label: column?.header as string || option?.label || field,
      onSelect: () => selectedValue.value = field
    }
  })
  options.unshift({
    type: 'label',
    label: '替换排序条件'
  })
  return options
})

const onToggleOrderType = () => {
  emit('change', props.field, props.opr === 'asc' ? 'desc' : 'asc')
}
</script>

<template>
  <div class="flex items-center gap-3 px-2.5">
    <div class="order-query-handle cursor-move flex">
      <UIcon name="i-lucide-grip-vertical" />
    </div>
    <UDropdownMenu
      :items="unselectedOptions"
      :ui="{ content: 'w-54' }"
    >
      <UButton
        variant="outline"
        color="neutral"
        size="sm"
        trailing-icon="i-lucide-chevron-down"
      >
        {{ selectedLabel }}
      </UButton>
    </UDropdownMenu>
    <UButton
      :icon="props.opr === 'asc' ? 'i-lucide-arrow-up-narrow-wide' : 'i-lucide-arrow-down-wide-narrow'"
      color="neutral"
      variant="outline"
      size="sm"
      @click="onToggleOrderType"
    >
      {{ props.opr === 'asc' ? '升序' : '降序' }}
    </UButton>
    <UTooltip text="删除该排序条件" :content="{ side: 'top' }">
      <UButton
        size="xs"
        icon="i-lucide-x"
        variant="ghost"
        color="neutral"
        class="ml-auto"
        @click="emit('remove')"
      />
    </UTooltip>
  </div>
</template>
