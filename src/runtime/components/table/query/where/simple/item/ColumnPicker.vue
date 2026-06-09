<script setup lang="ts" generic="T">
import type { ListboxItem } from '@nuxt/ui'
import type { WhereQueryItem, WhereQueryOption } from '#v/types'
import { computed, nextTick } from 'vue'
import { useTableOpr } from '#v/composables/table/useTableOpr'
import ButtonDropdown from '#v/components/button/Dropdown.vue'
import { tableWhereQueryItemIconMap } from '#v/constants'

const props = defineProps<{
  options: WhereQueryOption<T>[]
  disabled?: boolean
  focus?: () => void
}>()

const whereQueryItem = defineModel<WhereQueryItem<T>>('whereQueryItem', { required: true })

const items = computed<ListboxItem[]>(() => {
  const commonItems: ListboxItem[] = []
  const otherItems: ListboxItem[] = []

  props.options.forEach((option) => {
    const item: ListboxItem = {
      label: option.label,
      value: option.field,
      icon: tableWhereQueryItemIconMap.get(option.type) || 'field',
      onSelect: () => {
        modelValue.value = option.field as string
        nextTick(() => {
          props.focus?.()
        })
      }
    }
    if (option.preferred === true) {
      commonItems.push(item)
    } else {
      otherItems.push(item)
    }
  })

  const result: ListboxItem[] = []
  if (commonItems.length > 0) {
    result.push({ type: 'label', label: '常用查询条件' })
    result.push(...commonItems)
  }
  if (otherItems.length > 0) {
    if (result.length > 0) {
      result.push({ type: 'separator' })
    }
    result.push({ type: 'label', label: '其他查询条件' })
    result.push(...otherItems)
  }
  return result
})

const modelValue = computed({
  get() {
    return whereQueryItem.value.field as string
  },
  set(newField: string) {
    const newFieldOption = props.options.find(opt => opt.field === newField)
    if (!newFieldOption || !newFieldOption.type) {
      console.error('Cannot find field option for field:', newField)
      return
    }
    whereQueryItem.value = {
      field: newField,
      opr: useTableOpr().getDefaultOprByType(newFieldOption.type),
      value: null
    }
  }
})

const currentOption = computed(() => {
  return props.options.find(opt => opt.field === modelValue.value)
})
</script>

<template>
  <ButtonDropdown
    v-model="modelValue"
    :items="items"
  >
    <UButton
      :size="'sm'"
      :color="'neutral'"
      :variant="'outline'"
      :label="currentOption?.label || '选择字段'"
      :disabled="disabled"
      :icon="tableWhereQueryItemIconMap.get(currentOption?.type ?? 'unknown') || 'field'"
      :ui="{
        label: 'font-bold'
      }"
    />
  </ButtonDropdown>
</template>
