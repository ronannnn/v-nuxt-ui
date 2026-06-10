<script setup lang="ts" generic="T">
import type { OrderQueryOpr, OrderQueryOption, VColumn } from '#v/types'
import type { DropdownMenuItem } from '@nuxt/ui'
import { computed } from 'vue'

const props = defineProps<{
  field: string
  bizColumns: VColumn<T>[]
  opr: OrderQueryOpr
  orderOptions: OrderQueryOption<T>[]
  unselectedFields: string[]
  handleClassName?: string
  disabled?: boolean
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
  <UFieldGroup size="sm">
    <UButton
      variant="outline"
      icon="i-lucide-grip-vertical"
      color="neutral"
      class="cursor-move hover:bg-default active:bg-default"
      :class="handleClassName"
      :disabled="disabled"
    />
    <UDropdownMenu
      :items="unselectedOptions"
      size="sm"
      :ui="{ content: 'w-54' }"
      :disabled="disabled"
    >
      <UButton
        variant="outline"
        color="neutral"
        size="sm"
        :disabled="disabled"
      >
        {{ selectedLabel }}
      </UButton>
    </UDropdownMenu>
    <UButton
      :icon="props.opr === 'asc' ? 'i-lucide-arrow-up-narrow-wide' : 'i-lucide-arrow-down-wide-narrow'"
      color="neutral"
      variant="outline"
      size="sm"
      :disabled="disabled"
      @click="onToggleOrderType"
    >
      {{ props.opr === 'asc' ? '升序' : '降序' }}
    </UButton>
    <UButton
      size="xs"
      icon="i-lucide-x"
      variant="outline"
      color="neutral"
      :disabled="disabled"
      @click="emit('remove')"
    />
  </UFieldGroup>
</template>
