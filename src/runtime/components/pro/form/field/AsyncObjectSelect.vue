<script setup lang="ts" generic="T">
import type { VFormFieldAsyncSelectProps } from '../../../../types'

const props = withDefaults(defineProps<VFormFieldAsyncSelectProps<T>>(), {
  valueField: 'id'
})

const modelValue = defineModel<T[] | undefined>('modelValue', { required: true })

const initModelValue = ref<T[] | undefined>(modelValue.value)
const modelValueWithValueField = ref(modelValue.value?.map(item => item[props.valueField]))

watch(
  [initModelValue, modelValueWithValueField],
  () => {
    const newModelValue: T[] = []
    modelValueWithValueField.value?.forEach((value) => {
      const item = initModelValue.value?.find(item => item[props.valueField] === value)
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
  <ProFormFieldAsyncSelect
    v-bind="props"
    v-model="modelValueWithValueField"
    :init-model-values="initModelValue"
    @update-init-model-values="newInitModelValues => initModelValue = newInitModelValues"
  />
</template>
