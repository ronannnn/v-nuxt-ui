<script setup lang="ts">
defineProps<{
  label: string
  description?: string
}>()
</script>

<template>
  <div class="flex items-center gap-12 justify-between min-h-4">
    <div class="flex flex-col flex-1">
      <span class="font-bold text-sm">{{ label }}</span>
      <span v-if="description" class="text-xs text-muted">{{ description }}</span>
    </div>
    <slot name="default" />
  </div>
</template>
