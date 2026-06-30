<script setup lang="ts">
import type { ButtonProps } from '@nuxt/ui'
import defu from 'defu'
import { computed, onBeforeUnmount, shallowRef } from 'vue'

const props = withDefaults(defineProps<{
  button?: ButtonProps
  confirmButton?: ButtonProps
  complete?: boolean
  completeButton?: ButtonProps | false
  completeDuration?: number
  resetOnMouseleave?: boolean
  ui?: Record<string, any>
}>(), {
  completeDuration: 1200,
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
}) as ButtonProps)
const confirmButtonProps = computed(() => defu(props.confirmButton, {
  color: 'error',
  variant: 'ghost',
  size: 'sm',
  label: '确认'
}) as ButtonProps)
const completeButtonProps = computed(() => defu(props.completeButton || {}, {
  color: 'success',
  variant: 'soft',
  size: 'sm',
  icon: 'i-lucide-check',
  label: '已完成',
  disabled: true
}) as ButtonProps)

const confirming = defineModel<boolean>('confirming', { default: false })
const completed = shallowRef(false)
const completeTimer = shallowRef<ReturnType<typeof setTimeout> | undefined>()

const hasCompleteState = computed(() => props.completeButton !== false && (props.complete || props.completeButton !== undefined))
const activeButton = computed(() => {
  if (completed.value) return completeButtonProps.value
  return confirming.value ? confirmButtonProps.value : buttonProps.value
})

function clearCompleteTimer() {
  if (!completeTimer.value) return
  clearTimeout(completeTimer.value)
  completeTimer.value = undefined
}

function showCompleteState() {
  if (!hasCompleteState.value) return
  completed.value = true
  clearCompleteTimer()
  completeTimer.value = setTimeout(() => {
    completed.value = false
    completeTimer.value = undefined
  }, props.completeDuration)
}

const onClick = () => {
  if (completed.value || activeButton.value?.disabled) return
  if (!confirming.value) {
    confirming.value = true
    return
  }
  confirming.value = false
  emit('confirm')
  showCompleteState()
}

onBeforeUnmount(clearCompleteTimer)
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
