<script setup lang="ts">
import type { ButtonProps } from '@nuxt/ui'
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  button?: ButtonProps
  confirmButton?: ButtonProps
  resetOnMouseleave?: boolean
  ui?: Record<string, any>
}>(), {
  button: () => ({
    icon: 'i-lucide-x',
    color: 'neutral',
    variant: 'ghost',
    size: 'sm'
  }),
  confirmButton: () => ({
    label: '确认',
    color: 'error',
    variant: 'ghost',
    size: 'sm'
  }),
  resetOnMouseleave: true
})

const emit = defineEmits<{
  confirm: []
}>()

const confirming = defineModel<boolean>('confirming', { default: false })

const activeButton = computed(() => confirming.value ? props.confirmButton : props.button)

const onClick = () => {
  if (activeButton.value?.disabled) return
  if (!confirming.value) {
    confirming.value = true
    return
  }
  confirming.value = false
  emit('confirm')
}
</script>

<template>
  <UButton
    v-bind="activeButton"
    :ui="ui"
    class="transition-all duration-200 ease-out"
    @click="onClick"
    @mouseleave="() => {
      if (resetOnMouseleave) confirming = false
    }"
  />
</template>
