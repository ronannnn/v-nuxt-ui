<script setup lang="ts">
import type { InputProps } from '@nuxt/ui'

defineProps<{
  disabled?: boolean
  onTriggerSubmit?: (e: Event) => void
  enterKeydownSubmit?: boolean
} & Pick<InputProps, 'placeholder'>>()

const modelValue = defineModel<string | undefined>('modelValue', { required: true })
const input = useTemplateRef('input')
</script>

<template>
  <UInput
    ref="input"
    v-model="modelValue"
    class="w-full"
    :disabled="disabled"
    :placeholder="placeholder"
    :model-modifiers="{ trim: true }"
    @keydown.enter="(e: Event) => {
      if (enterKeydownSubmit) {
        onTriggerSubmit?.(e)
      }
    }"
  >
    <template v-if="modelValue?.length" #trailing>
      <UButton
        color="neutral"
        variant="link"
        size="sm"
        icon="i-lucide-circle-x"
        aria-label="Clear input"
        @click="() => {
          modelValue = undefined
          input?.inputRef?.focus()
        }"
      />
    </template>
  </UInput>
</template>
