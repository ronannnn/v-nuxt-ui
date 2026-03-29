<script setup lang="ts">
import { computed } from 'vue'
import type { VFormFieldSelectProps } from '#v/types'

const props = defineProps<{
  disabled?: boolean
  icon?: string
} & VFormFieldSelectProps>()

const modelValue = defineModel<string | null | undefined>('modelValue', { required: true })

const selectItems = computed(() => props.enableEmptyOption
  ? [{ label: '无', value: 0 }, ...(props.items ?? [])]
  : props.items ?? []
)
</script>

<template>
  <USelectMenu
    v-model="modelValue"
    :items="selectItems"
    :search-input="searchable ?? false"
    :icon="icon ? icon : (multiple ? 'i-lucide-list-todo' : undefined)"
    :placeholder="placeholder"
    value-key="value"
    class="w-full"
    :disabled="disabled"
  />
</template>
