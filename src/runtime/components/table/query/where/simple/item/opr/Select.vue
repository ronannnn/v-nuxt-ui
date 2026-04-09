<script setup lang="ts" generic="T">
import type { WhereQueryItem } from '#v/types'
import type { InputMenuItem, InputMenuProps } from '@nuxt/ui'
import { computed, ref, useTemplateRef } from 'vue'

const props = defineProps<{
  disabled?: boolean
  items: InputMenuItem[]
  placeholder?: InputMenuProps['placeholder']
}>()

const whereQueryItem = defineModel<WhereQueryItem<T>>('whereQueryItem', { required: true })

const inputMenuValue = computed<(string | number)[]>({
  get() {
    return whereQueryItem.value.value
  },
  set(newValue) {
    whereQueryItem.value = { ...whereQueryItem.value, value: newValue }
  }
})

const searchTerm = ref('')
const filteredItems = computed(() => {
  if (!searchTerm.value) {
    return props.items
  }
  return props.items.filter(item => (item as any)?.label.toLowerCase().includes(searchTerm.value.toLowerCase()))
})

const inputMenuRef = useTemplateRef('inputMenu')
defineExpose({
  focus: () => {
    inputMenuRef.value?.inputRef.focus()
  }
})
</script>

<template>
  <UInputMenu
    ref="inputMenu"
    v-model:search-term="searchTerm"
    v-model="inputMenuValue"
    :items="filteredItems"
    :placeholder="placeholder"
    multiple
    color="neutral"
    delete-icon="i-lucide-trash"
    value-key="value"
    clear
    clear-icon="i-lucide-circle-x"
    icon=""
    :disabled="disabled"
    open-on-focus
    trailing
    :ui="{
      root: 'rounded-none min-w-32', // TODO: 不然有rounded，这个应该是个bug
      content: 'min-w-fit',
      tagsInput: 'min-w-4 w-0'
    }"
    :content="{
      align: 'start'
    }"
    @update:model-value="() => {
      inputMenuRef?.inputRef.focus()
    }"
  />
</template>
