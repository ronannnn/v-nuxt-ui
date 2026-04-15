<script setup lang="ts" generic="T">
import { ref, watch } from 'vue'
import AsyncSelect from './AsyncSelect.vue'
import type { VFormFieldAsyncSelectProps } from '#v/types'

const props = defineProps<VFormFieldAsyncSelectProps<T>>()

const modelValue = defineModel<T[] | undefined>('modelValue', { required: true })

const modelValueWithValueField = ref(modelValue.value?.map(item => item[props.valueField]) as (string[] | number[] | undefined))

watch(
  [props.initModel, modelValueWithValueField],
  () => {
    const newModelValue: T[] = []
    modelValueWithValueField.value?.forEach((value) => {
      const initModelArray = Array.isArray(props.initModel) ? props.initModel : [props.initModel].filter(Boolean)
      const item = initModelArray.find(innerItem => (innerItem as T)[props.valueField] === value)
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
  />
</template>
