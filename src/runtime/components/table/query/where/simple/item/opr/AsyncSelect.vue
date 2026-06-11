<script setup lang="ts" generic="T">
import { computed, useTemplateRef } from 'vue'
import type { WhereQueryItem, VAsyncSelectProps } from '#v/types'
import VAsyncSelect from '#v/components/AsyncSelect.vue'

const props = withDefaults(defineProps<VAsyncSelectProps<T>>(), {
  size: 'sm'
})

const whereQueryItem = defineModel<WhereQueryItem<T>>('whereQueryItem', { required: true })

const modelValue = computed({
  get() {
    return {
      values: whereQueryItem.value.value as string[] | number[] | undefined,
      extraModels: whereQueryItem.value.extraData
    }
  },
  set(newValue) {
    whereQueryItem.value = {
      ...whereQueryItem.value,
      value: newValue.values,
      extraData: newValue.extraModels
    }
  }
})

const asyncSelectRef = useTemplateRef('asyncSelect')
defineExpose({
  focus: () => {
    asyncSelectRef.value?.focus()
  }
})
</script>

<template>
  <VAsyncSelect
    ref="asyncSelect"
    v-bind="props"
    v-model="modelValue"
    :placeholder="`请选择${label ?? ''}`"
  />
</template>
