<script setup lang="ts" generic="T">
import type { CommandPaletteGroup } from '@nuxt/ui'
import type { WhereQueryItem, WhereQueryOpr, WhereQueryOption } from '#v/types'
import { computed, nextTick } from 'vue'
import { useTableOpr } from '#v/composables/table/useTableOpr'
import ButtonDropdown from '#v/components/button/Dropdown.vue'

const props = defineProps<{
  options: WhereQueryOption<T>[]
  disabled?: boolean
  focus?: () => void
}>()

const whereQueryItem = defineModel<WhereQueryItem<T>>('whereQueryItem', { required: true })

const option = computed<WhereQueryOption<T> | undefined>(() =>
  props.options.find(opt => opt.field === whereQueryItem.value.field)
)

const items = computed<CommandPaletteGroup[]>(() => {
  if (!option.value || !option.value.type) {
    console.error('Cannot find field option or missing type for field:', whereQueryItem.value.field)
    return []
  }

  return [
    {
      id: 'operators',
      label: '操作符',
      items: useTableOpr()
        .getOprNameOptionsByType(option.value.type)
        .map(option => ({
          label: option.label,
          value: option.value,
          onSelect: () => {
            modelValue.value = option.value as string
            nextTick(() => {
              props.focus?.()
            })
          }
        }))
    }
  ]
})

const modelValue = computed<string>({
  get() {
    return whereQueryItem.value.opr as string
  },
  set(newOpr: string) {
    whereQueryItem.value = {
      ...whereQueryItem.value,
      opr: newOpr as WhereQueryOpr,
      value: null
    }
  }
})

const currentLabel = computed(() => {
  if (!option.value?.type) return ''
  return useTableOpr().getOprNameByTypeAndOpr(option.value.type, modelValue.value as WhereQueryOpr)
})
</script>

<template>
  <!-- NOTE: 自己实现DropdownMenu, 原生DropdownMenu的Focus有问题，会让查询字段打开的Popover关闭 -->
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
