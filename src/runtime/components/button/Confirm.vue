<script setup lang="ts">
import type { ButtonProps } from '@nuxt/ui'
import defu from 'defu'
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  button?: ButtonProps
  confirmButton?: ButtonProps
  resetOnMouseleave?: boolean
  ui?: Record<string, any>
}>(), {
  resetOnMouseleave: true
})

const emit = defineEmits<{
  confirm: []
}>()

const buttonProps = computed(() => defu(props.button, {
  icon: 'i-lucide-x',
  color: 'neutral',
  variant: 'link',
  size: 'sm'
}))
const confirmButtonProps = computed(() => defu(props.confirmButton, {
  color: 'error',
  variant: 'ghost',
  size: 'sm',
  label: '确认'
}))

const confirming = defineModel<boolean>('confirming', { default: false })

const activeButton = computed(() => confirming.value ? confirmButtonProps.value : buttonProps.value)

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
