<script setup lang="ts" generic="T">
import { computed } from 'vue'
import type { VFormFieldSelectProps } from '#v/types'
import VSelect from '#v/components/Select.vue'

const props = defineProps<VFormFieldSelectProps<T>>()

const modelValue = defineModel<string | number | string[] | number[] | undefined>('modelValue', { required: true })

const selectItems = computed(() => props.enableEmptyOption
  ? [{ label: '无', value: 0 }, ...(props.items ?? [])]
  : props.items ?? []
)
</script>

<template>
  <VSelect
    v-model="modelValue"
    v-bind="props"
    :items="selectItems"
    :icon="icon ? icon : (multiple ? 'i-lucide-list-todo' : undefined)"
    :placeholder="placeholder"
    value-key="value"
    class="w-full"
    :disabled="disabled"
  />
</template>
