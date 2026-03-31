<script setup lang="ts">
import { computed, useTemplateRef } from 'vue'
import { isEmptyString } from '#v/utils'
import type { InputProps } from '@nuxt/ui'

defineProps<{
  disabled?: boolean
  trailingString?: string
} & Pick<InputProps, 'placeholder'>>()

const modelValue = defineModel<string | null | undefined>('modelValue', { required: true })
const numberModelValue = computed<number | null>({
  get: () => modelValue.value ? Number(modelValue.value) : null,
  set(newValue) {
    if (isEmptyString(newValue?.toString()) || isNaN(Number(newValue))) {
      modelValue.value = '0'
      return
    }
    modelValue.value = newValue?.toString()
  }
})
const input = useTemplateRef('input')
</script>

<template>
  <UFieldGroup class="w-full">
    <UInput
      ref="input"
      v-model="numberModelValue"
      class="w-full"
      type="number"
      icon="i-lucide-hash"
      :disabled="disabled"
      :placeholder="placeholder"
    >
      <template v-if="modelValue?.length" #trailing>
        <UButton
          color="neutral"
          variant="link"
          size="sm"
          icon="i-lucide-circle-x"
          aria-label="Clear input"
          @click="() => {
            numberModelValue = 0
            input?.inputRef?.focus()
          }"
        />
      </template>
    </UInput>
    <UButton
      v-if="!isEmptyString(trailingString)"
      :label="trailingString"
      variant="outline"
      color="neutral"
      disabled
    />
  </UFieldGroup>
</template>
