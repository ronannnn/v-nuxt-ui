<script setup lang="ts" generic="T">
import type { AsyncSelectCombinedValue, AsyncSelectValue, VFormFieldAsyncSelectProps } from '#v/types'
import VAsyncSelect from '#v/components/AsyncSelect.vue'
import { computed } from 'vue'

const props = withDefaults(defineProps<VFormFieldAsyncSelectProps<T>>(), {
  extraQuery: () => ({
    pagination: { pageNum: 1, pageSize: 10 },
    orderQuery: [
      { field: 'createdAt', order: 'desc' }
    ]
  })
})

const modelValue = defineModel<AsyncSelectValue>('modelValue', { required: true })

const asyncSelectModelValue = computed<AsyncSelectCombinedValue>({
  get() {
    return {
      values: modelValue.value,
      extraModels: props.initModel as any
    }
  },
  set(newModelValue) {
    modelValue.value = newModelValue.values as string[] | number[] | undefined
    props.onUpdateInitModel?.(newModelValue.extraModels)
  }
})
</script>

<template>
  <VAsyncSelect
    v-bind="props"
    v-model="asyncSelectModelValue"
    class="w-full"
  />
</template>
