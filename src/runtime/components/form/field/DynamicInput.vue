<script setup lang="ts">
import { watch } from 'vue'

defineProps<{
  disabled?: boolean
}>()

const modelValue = defineModel<string[] | undefined | null>('modelValue', { required: true })
watch(
  modelValue,
  () => {
    if (!modelValue.value || modelValue.value.length === 0) {
      modelValue.value = ['']
    }
  },
  { immediate: true }
)
</script>

<template>
  <div class="flex flex-col gap-2 w-full">
    <UFieldGroup v-for="(value, idx) in modelValue" :key="idx" class="w-full">
      <UInput
        :model-value="value"
        class="w-full"
        @update:model-value="(val) => {
          const newList = [...modelValue ?? []]
          newList[idx] = val
          modelValue = newList
        }"
      />
      <UButton
        color="neutral"
        variant="outline"
        icon="i-lucide-minus"
        @click="() => {
          const newList = [...modelValue ?? []]
          newList.splice(idx, 1)
          modelValue = newList
        }"
      />
      <UButton
        color="neutral"
        variant="outline"
        icon="i-lucide-plus"
        @click="() => {
          const newList = [...modelValue ?? []]
          newList.push('')
          modelValue = newList
        }"
      />
    </UFieldGroup>
  </div>
</template>
