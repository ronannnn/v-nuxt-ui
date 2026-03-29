<script setup lang="ts">
import { inject, computed } from 'vue'

interface Props {
  permission: string | string[]
  mode?: 'hide' | 'disable'
  fallback?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'disable',
  fallback: false
})

// Use the consuming app's hasPermissions function via provide/inject.
// The consuming app should provide('vui:hasPermissions', (perms) => boolean).
// Falls back to always granting permission if not provided.
const hasPermissionsFn = inject<(perms: string | string[]) => boolean>('vui:hasPermissions', () => true)

const hasPerm = computed(() => {
  if (!props.permission) return true
  return hasPermissionsFn(props.permission)
})

const shouldShow = computed(() => {
  if (props.mode === 'hide') {
    return hasPerm.value
  }
  return true
})

const shouldDisable = computed(() => {
  return props.mode === 'disable' && !hasPerm.value
})

const handleClick = (e: Event) => {
  if (shouldDisable.value) {
    e.stopPropagation()
    e.preventDefault()
  }
}
</script>

<template>
  <div
    v-if="shouldShow"
    @click.capture="handleClick"
  >
    <slot />
  </div>
  <div v-else-if="fallback">
    <slot name="fallback">
      <div class="text-gray-400 text-sm">
        No permission
      </div>
    </slot>
  </div>
</template>
