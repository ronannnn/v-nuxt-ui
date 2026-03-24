<script setup lang="ts">
defineProps<{
  loading: boolean | undefined
}>()
</script>

<template>
  <div class="relative">
    <Transition name="fade">
      <div
        v-if="loading"
        class="absolute inset-0 bg-default/75 flex items-center justify-center rounded-md z-10"
      >
        <UIcon
          name="i-lucide-loader-circle"
          class="animate-spin text-muted size-6"
        />
      </div>
    </Transition>
    <slot />
  </div>
</template>
