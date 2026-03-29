<script setup lang="ts">
import { ref } from 'vue'
import type { InputProps } from '@nuxt/ui'

defineProps<{
  disabled?: boolean
  onTriggerSubmit?: (e: Event) => void
  enterKeydownSubmit?: boolean
} & Pick<InputProps, 'placeholder'>>()

const modelValue = defineModel<string | undefined>('modelValue', { required: true })
const showTxt = ref(false)
</script>

<template>
  <UInput
    v-model="modelValue"
    class="w-full"
    :type="showTxt ? 'text' : 'password'"
    :placeholder="placeholder"
    :disabled="disabled"
    :ui="{ trailing: 'pe-1' }"
    @keydown.enter="(e: Event) => {
      if (enterKeydownSubmit) {
        onTriggerSubmit?.(e)
      }
    }"
  >
    <template #trailing>
      <UButton
        color="neutral"
        variant="link"
        size="sm"
        :icon="showTxt ? 'i-lucide-eye-off' : 'i-lucide-eye'"
        :aria-label="showTxt ? 'Hide password' : 'Show password'"
        :aria-pressed="showTxt"
        aria-controls="password"
        @click="showTxt = !showTxt"
      />
    </template>
  </UInput>
</template>
