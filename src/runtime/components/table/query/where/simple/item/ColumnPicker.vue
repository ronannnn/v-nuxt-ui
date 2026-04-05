<script setup lang="ts" generic="T">
import type { CommandPaletteGroup } from '@nuxt/ui'
import type { WhereQueryItem, WhereQueryOption } from '#v/types'
import { computed, nextTick } from 'vue'
import { useTableOpr } from '#v/composables/table/useTableOpr'
import ButtonDropdown from '#v/components/button/Dropdown.vue'

const props = defineProps<{
  options: WhereQueryOption<T>[]
  disabled?: boolean
  focus?: () => void
}>()

const whereQueryItem = defineModel<WhereQueryItem<T>>('whereQueryItem', { required: true })

const items = computed<CommandPaletteGroup[]>(() => {
  return [
    {
      id: 'query-fields',
      label: '查询字段',
      items: props.options.map(option => ({
        label: option.label,
        value: option.field,
        onSelect: () => {
          modelValue.value = option.field as string
          nextTick(() => {
            props.focus?.()
          })
        }
      }))
    }
  ]
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

const currentLabel = computed(() => {
  const option = props.options.find(opt => opt.field === modelValue.value)
  return option?.label || ''
})
</script>

<template>
  <ButtonDropdown
    v-model="modelValue"
    :groups="items"
  >
    <UButton
      :size="'sm'"
      :color="'neutral'"
      :variant="'outline'"
      :label="currentLabel"
      :disabled="disabled"
    />
  </ButtonDropdown>
</template>
