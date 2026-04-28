<script setup lang="ts" generic="T">
import { ref, watch } from 'vue'
import AsyncSelect from './AsyncSelect.vue'
import type { VFormFieldAsyncSelectProps } from '#v/types'

const props = defineProps<VFormFieldAsyncSelectProps<T>>()

const modelValue = defineModel<T[] | undefined>('modelValue', { required: true })

const modelValueWithValueField = ref(modelValue.value?.map(item => item[props.valueField]) as (string[] | number[] | undefined))

watch(
  [() => props.initModel, modelValueWithValueField],
  () => {
    const ids = modelValueWithValueField.value
    if (!ids || ids.length === 0) {
      if (modelValue.value && modelValue.value.length > 0) {
        modelValue.value = []
      }
      return
    }

    const initModelArray = Array.isArray(props.initModel)
      ? props.initModel
      : [props.initModel].filter(Boolean)

    const newModelValue: T[] = []
    ids.forEach((value) => {
      const item = initModelArray.find(innerItem => (innerItem as T)[props.valueField] === value)
      if (item) {
        newModelValue.push(item as T)
      }
    })

    const currentIds = modelValue.value?.map(v => (v as T)[props.valueField]) ?? []
    const newIds = newModelValue.map(v => (v as T)[props.valueField])
    if (currentIds.length !== newIds.length || currentIds.some((id, i) => id !== newIds[i])) {
      modelValue.value = newModelValue
    }
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
