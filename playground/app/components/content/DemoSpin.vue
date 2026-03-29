<script setup lang="ts">
const loading = ref(true)
</script>

<template>
  <div class="border border-default rounded-lg p-6 space-y-4">
    <div class="flex items-center gap-4">
      <USwitch v-model="loading" label="Loading" />
    </div>

    <USeparator />

    <ProSpin :loading="loading">
      <div class="p-6 space-y-3">
        <div class="h-4 bg-muted rounded w-3/4" />
        <div class="h-4 bg-muted rounded w-1/2" />
        <div class="h-4 bg-muted rounded w-5/6" />
        <div class="h-4 bg-muted rounded w-2/3" />
      </div>
    </ProSpin>
  </div>
</template>
