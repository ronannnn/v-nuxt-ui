<script setup lang="ts" generic="T">
import { ref, watch } from 'vue'
import type { VFormFieldAsyncSelectProps } from '#v/types'
import AsyncSelect from './AsyncSelect.vue'

const props = defineProps<VFormFieldAsyncSelectProps<T>>()

const modelValue = defineModel<T[] | undefined>('modelValue', { required: true })

const initModelValue = ref<T[] | undefined>(modelValue.value)
const modelValueWithValueField = ref(modelValue.value?.map(item => item[props.valueField]) as (string[] | number[] | undefined))

watch(
  [initModelValue, modelValueWithValueField],
  () => {
    const newModelValue: T[] = []
    modelValueWithValueField.value?.forEach((value) => {
      const item = initModelValue.value?.find(innerItem => (innerItem as T)[props.valueField] === value)
      if (item) {
        newModelValue.push(item as T)
      }
    })
    modelValue.value = newModelValue
  },
  { immediate: true }
)
</script>

<template>
  <AsyncSelect
    v-bind="props"
    v-model="modelValueWithValueField"
    :init-model-values="initModelValue"
    @update-init-model-values="newInitModelValues => initModelValue = newInitModelValues"
  />
</template>
