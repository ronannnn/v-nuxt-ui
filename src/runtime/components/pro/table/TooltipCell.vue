<script setup lang="ts">
defineProps<{
  value: string | null | undefined
  tooltipText: string | null | undefined
}>()
</script>

<template>
  <div class="flex items-center">
    <div>
      {{ value }}
    </div>
    <UTooltip :text="tooltipText ?? ''" :content="{ side: 'top' }">
      <UButton
        icon="i-lucide-circle-question-mark"
        color="neutral"
        size="xs"
        variant="link"
        class="cursor-default"
      />
    </UTooltip>
  </div>
</template>
