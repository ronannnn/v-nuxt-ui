<script setup lang="ts">
defineProps<{
  nodeCount: number
  edgeCount: number
}>()
</script>

<template>
  <div class="bg-default rounded-md p-2 flex flex-col items-center gap-1 shadow-sm">
    <UBadge variant="outline" color="neutral" icon="i-lucide-circle-dot">
      节点数 {{ nodeCount }}
    </UBadge>
    <UBadge variant="outline" color="neutral" icon="i-lucide-arrow-right-left">
      连接数 {{ edgeCount }}
    </UBadge>
  </div>
</template>
