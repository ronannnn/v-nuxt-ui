<script setup lang="ts" generic="T">
import type { AsyncSelectCombinedValue, VFormFieldAsyncTreeSelectProps } from '#v/types'
import VAsyncTreeSelect from '#v/components/AsyncTreeSelect.vue'
import { computed } from 'vue'

const props = withDefaults(defineProps<VFormFieldAsyncTreeSelectProps<T>>(), {
  extraQuery: () => ({
    orderQuery: [
      { field: 'createdAt', order: 'desc' }
    ]
  })
})

const modelValue = defineModel<number | undefined>('modelValue', { required: true })

const asyncTreeSelectModelValue = computed<AsyncSelectCombinedValue>({
  get() {
    return {
      values: modelValue.value,
      extraModels: props.initModel as any
    }
  },
  set(newModelValue) {
    modelValue.value = newModelValue.values as number | undefined
    props.onUpdateInitModel?.(newModelValue.extraModels)
  }
})
</script>

<template>
  <VAsyncTreeSelect
    v-bind="props"
    v-model="asyncTreeSelectModelValue"
  />
</template>
