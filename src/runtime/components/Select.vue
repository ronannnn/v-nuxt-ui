<script setup lang="ts" generic="T">
import type { VSelectProps } from '#v/types'
import { isEmptyString } from '#v/utils'
import type { InputMenuItem } from '@nuxt/ui'
import { computed, ref, useTemplateRef } from 'vue'

const props = defineProps<VSelectProps<T>>()

const modelValue = defineModel<string | number | string[] | number[] | undefined>('modelValue', { required: true })

const searchTerm = ref('')
const getItemLabel = (item: InputMenuItem) => {
  if (typeof item === 'string' || typeof item === 'number' || typeof item === 'boolean' || typeof item === 'bigint') {
    return String(item)
  }
  return String(item?.label ?? '')
}

const dropdownOpen = ref(false)

const filteredItems = computed(() => {
  if (isEmptyString(searchTerm.value) || !dropdownOpen.value) {
    return props.items
  }
  return props.items.filter(item => getItemLabel(item).toLowerCase().includes(searchTerm.value.toLowerCase()))
})

const ui = computed(() => ({
  root: ['min-w-32', props.roundedNone && 'rounded-none'].filter(Boolean).join(' '),
  base: 'peer',
  content: 'min-w-fit',
  tagsInput: 'min-w-4 w-0'
}))

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
    v-model:open="dropdownOpen"
    v-model:search-term="searchTerm"
    v-model="modelValue"
    :items="filteredItems"
    :placeholder="placeholder"
    :multiple="multiple"
    :size="size"
    color="neutral"
    delete-icon="i-lucide-trash"
    value-key="value"
    clear
    clear-icon="i-lucide-circle-x"
    :icon="icon"
    :disabled="disabled"
    open-on-focus
    trailing
    ignore-filter
    :ui="ui"
    :content="{
      align: 'start'
    }"
  />
</template>
