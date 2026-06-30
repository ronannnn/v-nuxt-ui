<script setup lang="ts" generic="T">
import type { VSelectProps } from '#v/types'
import { focusElement, isEmptyString } from '#v/utils'
import type { InputMenuItem } from '@nuxt/ui'
import { computed, ref, useTemplateRef } from 'vue'
import TruncateTooltip from '#v/components/TruncateTooltip.vue'

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
  root: ['w-full min-w-0', props.roundedNone && 'rounded-none'].filter(Boolean).join(' '),
  base: ['peer w-full min-w-0', props.multiple ? 'overflow-hidden !pe-7' : 'truncate'].join(' '),
  content: 'min-w-fit',
  tagsItem: 'max-w-full inline-flex min-w-0',
  tagsInput: 'min-w-4 w-0'
}))

const inputMenuRef = useTemplateRef('inputMenu')

interface FocusOptions {
  open?: boolean
  waitForStablePosition?: boolean
}

function getInputElement() {
  return inputMenuRef.value?.inputRef
}

defineExpose({
  focus: (options?: FocusOptions) => {
    focusElement(getInputElement, {
      afterFocus: options?.open ? () => dropdownOpen.value = true : undefined,
      waitForStablePosition: options?.waitForStablePosition
    })
  }
})

function findLabel(tagItem: unknown): string {
  if (tagItem && typeof tagItem === 'object' && 'label' in tagItem) {
    return String((tagItem as Record<string, unknown>).label ?? '')
  }
  const match = props.items.find(i => i != null && String((i as any).value) === String(tagItem))
  return (match as any)?.label ?? String(tagItem ?? '')
}

const showPlaceholder = computed(() => {
  if (props.multiple) {
    return (!modelValue.value || (Array.isArray(modelValue.value) && modelValue.value.length === 0)) ? props.placeholder : ''
  }
  return !modelValue.value ? props.placeholder : ''
})
</script>

<template>
  <UInputMenu
    ref="inputMenu"
    v-model:open="dropdownOpen"
    v-model:search-term="searchTerm"
    v-model="modelValue"
    :items="filteredItems"
    :placeholder="showPlaceholder && placeholder"
    :multiple="multiple"
    :size="size"
    color="neutral"
    delete-icon="i-lucide-trash"
    value-key="value"
    :clear="{
      ui: {
        leadingIcon: 'size-3 text-dimmed'
      }
    }"
    clear-icon="i-lucide-circle-x"
    :icon="icon"
    :disabled="disabled"
    open-on-focus
    trailing
    trailing-icon=""
    ignore-filter
    :ui="ui"
    :content="{
      align: 'start'
    }"
  >
    <template v-if="multiple" #tags-item-text="{ item }">
      <TruncateTooltip :text="findLabel(item)" />
    </template>
  </UInputMenu>
</template>
