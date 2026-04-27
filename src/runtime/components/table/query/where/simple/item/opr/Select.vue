<script setup lang="ts" generic="T">
import type { VSelectProps, WhereQueryItem } from '#v/types'
import { computed, useTemplateRef } from 'vue'
import VSelect from '#v/components/Select.vue'

const props = withDefaults(defineProps<VSelectProps<T>>(), {
  size: 'sm'
})

const whereQueryItem = defineModel<WhereQueryItem<T>>('whereQueryItem', { required: true })

const modelValue = computed<string[] | number[]>({
  get() {
    return whereQueryItem.value.value
  },
  set(newValue) {
    whereQueryItem.value = { ...whereQueryItem.value, value: newValue }
  }
})

const selectRef = useTemplateRef('select')
defineExpose({
  focus: () => {
    selectRef.value?.focus()
  }
})
</script>

<template>
  <VSelect
    ref="select"
    v-bind="props"
    v-model="modelValue"
    :placeholder="`请选择${label ?? ''}`"
    rounded-none
  />
</template>
