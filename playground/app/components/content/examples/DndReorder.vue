<script setup lang="ts">
const items = ref([
  { id: 1, name: 'Item A', color: 'primary' },
  { id: 2, name: 'Item B', color: 'success' },
  { id: 3, name: 'Item C', color: 'warning' },
  { id: 4, name: 'Item D', color: 'error' },
  { id: 5, name: 'Item E', color: 'info' }
])
</script>

<template>
  <div class="space-y-4">
    <p class="text-sm text-muted">
      Drag items to reorder. Use the grip handle on the left.
    </p>
    <div class="max-w-sm">
      <ProDnd v-model="items" handle=".handle">
        <div
          v-for="item in items"
          :key="item.id"
          class="flex items-center gap-3 p-3 border border-default rounded-md mb-2 bg-default"
        >
          <UIcon name="i-lucide-grip-vertical" class="handle cursor-grab text-muted" />
          <UBadge :color="(item.color as any)" variant="subtle">
            {{ item.id }}
          </UBadge>
          <span class="text-sm">{{ item.name }}</span>
        </div>
      </ProDnd>
    </div>
    <p class="text-xs text-muted font-mono">
      Order: {{ items.map(i => i.name).join(' → ') }}
    </p>
  </div>
</template>
