<script setup lang="ts">
defineProps<{
  label: string
  color: string
  onClick: () => void
  disabled?: boolean
}>()
</script>

<template>
  <UButton
    variant="ghost"
    color="neutral"
    size="xs"
    @click="onClick"
  >
    <div class="flex items-center gap-2">
      <span
        class="inline-block size-1.5 rounded-full bg-(--chip-color)"
        :class="{ 'opacity-30': disabled }"
        :style="{
          '--chip-color': color
        }"
      />
      <div
        class="text-xs"
        :class="{ 'opacity-50 line-through': disabled }"
      >
        {{ label }}
      </div>
    </div>
    <div
      class="text-xs ml-auto"
      :class="{ 'opacity-50': disabled }"
    >
      <slot name="trailing" />
    </div>
  </UButton>
</template>
