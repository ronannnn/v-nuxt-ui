<script setup lang="ts">
import type { EmptyProps } from '@nuxt/ui'

withDefaults(defineProps<EmptyProps & { extraClass?: string }>(), {
  variant: 'naked',
  icon: 'i-lucide-inbox',
  title: '暂无数据',
  size: 'xs'
})
</script>

<template>
  <UEmpty
    :variant="variant"
    :icon="icon"
    :title="title"
    :size="size"
    :class="extraClass"
    class="h-full"
  />
</template>
