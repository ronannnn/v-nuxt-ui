<script setup lang="ts">
import type { InputProps } from '@nuxt/ui'
import { vMaska } from 'maska/vue'

defineProps<{
  placeholder?: InputProps['placeholder']
  size?: InputProps['size']
}>()
const value = defineModel<undefined | string>('value', { required: true })

const input = useTemplateRef('input')

defineExpose({
  focus: () => input.value?.inputRef?.focus()
})
</script>

<template>
  <UInput
    ref="input"
    v-model="value"
    v-maska="'####/##/##'"
    size="sm"
    class="w-full"
    icon="i-lucide-calendar"
    :placeholder="placeholder"
  >
    <template v-if="value?.length" #trailing>
      <UButton
        color="neutral"
        variant="link"
        size="sm"
        icon="i-lucide-circle-x"
        aria-label="Clear input"
        @click="() => {
          value = undefined
          input?.inputRef?.focus()
        }"
      />
    </template>
  </UInput>
</template>
