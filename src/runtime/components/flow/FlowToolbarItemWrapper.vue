<script setup lang="ts">
defineProps<{
  label: string
}>()
</script>

<template>
  <div class="flex items-center gap-3 justify-between min-h-4">
    <span class="font-bold text-sm">{{ label }}</span>
    <slot name="default" />
  </div>
</template>
